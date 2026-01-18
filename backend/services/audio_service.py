from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from services.transaction_service import TransactionService
from repositories.user_repository import UserRepository
from config.settings import settings
import azure.cognitiveservices.speech as speechsdk

class AudioService:
    def __init__(self):
        self.transaction_service = TransactionService()
        self.user_repository = UserRepository()
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.speech_region = settings.AZURE_SPEECH_REGION
        # Initialize OpenAI
        self.llm = ChatOpenAI(model="gpt-4o", openai_api_key=settings.OPENAI_API_KEY, temperature=0)
        self.pending_confirmations = {} # Stores pending actions waiting for "YES AI"

    async def process_audio_intent(self, user_id: str, recognized_text: str):
        """
        Takes recognized text, searches the vault, and returns a SMART response using Gemini.
        """
        print(f"\n🎤 [USER] input: '{recognized_text}'")
        
        # --- PHASE 0: HANDLE PENDING CONFIRMATIONS (YES AI) ---
        from services.agent_service import AgentService 

        if user_id in self.pending_confirmations:
            pending_action = self.pending_confirmations[user_id]
            # Normalize: lower case -> remove punctuation
            norm_text = recognized_text.lower().replace('.', '').replace(',', '').strip()
            
            # Flexible "YES AI" check handling punctuation variants like "Yes, A.I."
            if "yes ai" in norm_text:
                # EXECUTE
                print(f"🚀 [AGENT] User Confirmed. Executing: {pending_action['title']}")
                execution_result = await AgentService.execute_action(user_id, pending_action)
                del self.pending_confirmations[user_id] # Clear state
                
                if execution_result['status'] == 'success':
                    return f"Authentication confirmed. Payment of ${pending_action['amount']} to {pending_action.get('merchant', 'merchant')} is successful. Your updated balance is ${execution_result['new_balance']}."
                else:
                    return f"System Error: {execution_result.get('message', 'Could not complete transaction')}."
            
            elif "no" in norm_text or "cancel" in norm_text:
                del self.pending_confirmations[user_id]
                return "Understood. The transaction has been cancelled. Is there anything else I can help you with?"
            
            else:
                # If they say something else, remind them or treat as cancel?
                # For safety, let's treat non-confirmation as "Still waiting" or "Cancel". 
                # Let's simple return a prompt to be clear.
                return "I am waiting for your authorization. Please say 'YES AI' to confirm this transaction, or 'Cancel' to stop."
        
        # --- NORMAL FLOW ---
        print(f"🔍 [SYSTEM] Fetching context for User: {user_id}...")
        
        # 1. Fetch User Profile (Balance, Accounts, Name)
        user_profile = self.user_repository.get_user(user_id)
        profile_context = ""
        if user_profile:
             accounts = user_profile.get("accounts", [])
             loans = user_profile.get("loans", [])
             cc = user_profile.get("credit_cards", [])
             
             profile_context += f"User Name: {user_profile.get('name')}\n"
             profile_context += "ACCOUNTS:\n" + "\n".join([f"- {acc['type']}: ${acc['balance']} {acc['currency']}" for acc in accounts]) + "\n"
             if loans:
                 profile_context += "LOANS:\n" + "\n".join([f"- {l['type']}: Remaining ${l['remaining_balance']}" for l in loans]) + "\n"
             if cc:
                 profile_context += "CREDIT CARDS:\n" + "\n".join([f"- Card ending {c['card_id'][-4:]}: Balance ${c['current_balance']} / Limit ${c['limit']}" for c in cc]) + "\n"
        
        # 2. Search Vector Vault (Transactions)
        search_results = self.transaction_service.search_transactions(recognized_text, user_id=user_id)
        
        # 3. Prepare Context for AI
        transaction_context = "No specific transactions found."
        if search_results:
             transaction_context = "\n".join([f"- {tx['date']}: {tx['merchant']} for ${tx['amount']} ({tx['category']}) - {tx['description']}" for tx in search_results])

        # --- NEW: ACTIVE AGENTIC INTENT EXECUTION ---
        intent_response = ""
        normalized_text = recognized_text.lower()
        
        # Trigger: "pay" AND ("credit" OR "visa" OR "bill" OR "hydro" OR "rent")
        if "pay" in normalized_text or "transfer" in normalized_text or "send" in normalized_text:
            action_payload = None
            amount_to_pay = 0
            target_name = ""
            
            # Extract Amount
            import re
            numbers = re.findall(r'\d+', normalized_text)
            if numbers:
                amount_to_pay = float(numbers[0])
            # Default "full balance" or "all" logic
            if "balance" in normalized_text or "full" in normalized_text or "entire" in normalized_text or "amount" in normalized_text or "all" in normalized_text:
                 pass
            else:
                if not numbers: 
                    amount_to_pay = 100.0 # Default if no number
            
            # 1. PAY INTENTS
            if "pay" in normalized_text:
                if "credit" in normalized_text or "visa" in normalized_text:
                     if user_profile and user_profile.get("credit_cards"):
                         card = user_profile["credit_cards"][0]
                         if amount_to_pay == 0: 
                             amount_to_pay = card["current_balance"]
                         
                         target_name = card["name"]
                         action_payload = {
                             "type": "PAY_CC",
                             "amount": amount_to_pay,
                             "card_id": card["card_id"],
                             "title": f"Voice Payment to {card['name']}",
                             "merchant": "Credit Card Payment"
                         }

                elif "bill" in normalized_text or "hydro" in normalized_text or "rent" in normalized_text:
                     merchant = "Hydro One"
                     bill_id = "bill_hydro_oct" 
                     if "rent" in normalized_text:
                         merchant = "Landlord Corp"
                         bill_id = "bill_rent_nov"
                     
                     target_name = merchant
                     action_payload = {
                         "type": "PAY_BILL",
                         "amount": amount_to_pay if amount_to_pay > 0 else 150.0,
                         "bill_id": bill_id,
                         "merchant": merchant,
                         "title": f"Voice Payment to {merchant}"
                     }

            # 2. TRANSFER INTENTS
            elif "transfer" in normalized_text or "send" in normalized_text:
                target_type = "Savings" # Default destination
                if "chequing" in normalized_text or "checking" in normalized_text:
                    target_type = "Chequing"
                
                target_name = f"{target_type} Account"
                
                action_payload = {
                    "type": "TRANSFER",
                    "amount": amount_to_pay,
                    "to_account_type": target_type,
                    "title": f"Transfer to {target_name}",
                    "merchant": "Internal Transfer"
                }

            # INSTEAD OF EXECUTING, WE REQUEST AUTHENTICATION
            if action_payload:
                print(f"🔒 [AGENT] Requiring Confirmation for: {action_payload['title']}")
                self.pending_confirmations[user_id] = action_payload
                
                intent_response = f"[SYSTEM: I have prepared the transaction. ASK THE USER: 'I can process a {action_payload.get('title')} of ${action_payload['amount']}. To confirm, please say YES AI.']"



        full_context = f"""
        === USER PROFILE ===
        {profile_context}
        
        === RELEVANT TRANSACTIONS ===
        {transaction_context}

        === SYSTEM ACTION ===
        {intent_response}
        """

        print(f"📄 [DATA] Full Context:\n{full_context}")

        # 4. Generate Smart Response
        print("🤖 [AI] Analyzing details and formatting response...")
        
        system_prompt = """You are NeuroBank Guardian, a secure and highly knowledgeable Bilingual Banking Expert.
        
        YOUR ROLE:
        1. Contextual Banking Assistant: Use the provided 'USER PROFILE', 'ACCOUNTS', and 'RELEVANT TRANSACTIONS' to answer personal banking questions (e.g., "What is my balance?", "Did I pay Netflix?").
        2. General Banking Educator: If the user asks about general banking concepts (e.g., "What is an e-Transfer?", "How do I apply for a loan?", "What is a credit score?"), you MUST provide a detailed, easy-to-understand explanation.
        
        GUIDELINES FOR GENERAL QUESTIONS:
        - Explain the concept simply.
        - If applicable (like for loans or mortgages), list the "Required Documents" for application.
        - Be helpful and proactive.
        
        LANGUAGE INSTRUCTION:
        - DETECT the language of the user's input (English or French).
        - REPLY IN THE IDENTICAL LANGUAGE.
        - If the user speaks French, your entire response (including banking terms) must be in French.

        STRICT RULES:
        - If asked about personal data (balance, transactions) and it's NOT in the context, say you don't have that specific data.
        - Do not hallucinate personal numbers.
        - Be professional, secure, and friendly."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Context:\n{full_context}\n\nUser Question: {recognized_text}")
        ]
        
        ai_response = self.llm.invoke(messages)
        response_text = ai_response.content
        
        print(f"🗣️ [AVATAR] Response: {response_text}\n")
        return response_text

    def create_speech_recognizer(self):
        """
        Creates an Azure Speech Recognizer for processing streams.
        """
        if not self.speech_key or not self.speech_region:
            raise ValueError("Azure Speech Configuration missing.")
            
        speech_config = speechsdk.SpeechConfig(subscription=self.speech_key, region=self.speech_region)
        # We process audio pushed to a push stream
        stream = speechsdk.audio.PushAudioInputStream()
        audio_config = speechsdk.audio.AudioConfig(stream=stream)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        return recognizer, stream
