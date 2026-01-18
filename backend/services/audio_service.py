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

    async def process_audio_intent(self, user_id: str, recognized_text: str):
        """
        Takes recognized text, searches the vault, and returns a SMART response using Gemini.
        """
        print(f"\n🎤 [USER] input: '{recognized_text}'")
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
        
        print(f"✅ [SYSTEM] Found Profile + {len(search_results)} relevant transactions.")
        
        # 3. Prepare Context for AI
        transaction_context = "No specific transactions found."
        if search_results:
             transaction_context = "\n".join([f"- {tx['date']}: {tx['merchant']} for ${tx['amount']} ({tx['category']}) - {tx['description']}" for tx in search_results])

        # --- NEW: Mock Intent Detection for Bill Pay ---
        # Very simple keyword matching for demo purposes
        intent_response = ""
        normalized_text = recognized_text.lower()
        if "pay" in normalized_text and ("credit" in normalized_text or "bill" in normalized_text):
            # Simulate payment logic
            amount_to_pay = 0
            if "balance" in normalized_text or "full" in normalized_text:
                # Find credit card balance
                if user_profile and user_profile.get("credit_cards"):
                    amount_to_pay = user_profile["credit_cards"][0]["current_balance"]
            else:
                 # Try to extract a number, simple fallback
                 import re
                 numbers = re.findall(r'\d+', normalized_text)
                 if numbers:
                     amount_to_pay = int(numbers[0])
                 else:
                     amount_to_pay = 250 # Default demo amount
            
            intent_response = f" [ACTION: I have initiated a payment of ${amount_to_pay} to your {user_profile.get('credit_cards', [{'name': 'Credit Card'}])[0]['name']}.]"

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
