from langchain_google_genai import ChatGoogleGenerativeAI
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
        # Initialize Gemini
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GOOGLE_API_KEY)

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

        full_context = f"""
        === USER PROFILE ===
        {profile_context}
        
        === RELEVANT TRANSACTIONS ===
        {transaction_context}
        """

        print(f"📄 [DATA] Full Context:\n{full_context}")

        # 4. Generate Smart Response
        print("🤖 [AI] Analyzing details and formatting response...")
        
        system_prompt = """You are NeuroBank Guardian, a secure and precise banking AI. 
        Answer the user's question STRICTLY based on the provided context (Profile & Transactions). 
        
        - If asked about BALANCE/MONEY: Refer to the 'ACCOUNTS' section.
        - If asked about SPENDING/TRANSACTIONS: Refer to 'RELEVANT TRANSACTIONS'.
        - If the answer is not in the context, say you don't know. 
        
        Be concise, professional, and friendly. Do not hallucinate numbers."""
        
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
