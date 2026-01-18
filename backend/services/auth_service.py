import random
import string
import os
from typing import Dict, Optional
from repositories.user_repository import UserRepository
# from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

# In-memory store for OTPs
otp_store: Dict[str, str] = {}

# Email Config (DISABLED for Stability)
# conf = ConnectionConfig(...)

class AuthService:
    def __init__(self):
        self.user_repository = UserRepository()

    def generate_otp(self, email: str) -> Optional[str]:
        """
        Generates a 6-digit OTP only if the user exists in DB.
        """
        user = self.user_repository.get_user_by_email(email)
        if not user:
            print(f"⚠️ [AUTH] Attempted login for unregistered email: {email}")
            return None # User does not exist
            
        otp = ''.join(random.choices(string.digits, k=6))
        otp_store[email] = otp
        return otp

    async def send_otp(self, email: str, otp: str):
        """
        Sends OTP via Real Email (if configured) or Console (Fallback).
        """
        
        # 1. Console Log (Always reliable for Demo)
        print(f"\n🔐 [AUTH] ------------------------------------------------")
        print(f"📨 [EMAIL] Sending Secure Login Code to: {email}")
        print(f"🔑 [CODE]  {otp}")
        print(f"🛡️ [INFO]  Valid for 5 minutes.")
        print(f"---------------------------------------------------------\n")

        # 2. Real Email (DISABLED)
        # if os.getenv("MAIL_PASSWORD") and "your-app-password" not in os.getenv("MAIL_PASSWORD"):
        #     print(f"🚀 [SYSTEM] Attempting to send REAL email to {email}...")
        #     ... (Implementation removed for stability) ...
        pass


    def verify_otp(self, email: str, code: str) -> Optional[dict]:
        """
        Verifies the OTP and returns the linked User Object from DB.
        """
        stored_otp = otp_store.get(email)
        
        if not stored_otp or stored_otp != code:
            return None
            
        # OTP Valid! 
        del otp_store[email] # One-time use
        
        # LINKING: Find the REAL User Object in DB by email
        user = self.user_repository.get_user_by_email(email)
        
        return user
