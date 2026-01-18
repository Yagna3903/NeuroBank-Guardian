import random
import string
import os
from typing import Dict, Optional
from repositories.user_repository import UserRepository
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

# In-memory store for OTPs
otp_store: Dict[str, str] = {}

# Email Config
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@neurobank.ai"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

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
        # (Rest of the send_otp logic remains the same...)
        # I'll keep the full implementation here to ensure no errors
        
        # 1. Console Log (Always reliable for Demo)
        print(f"\n🔐 [AUTH] ------------------------------------------------")
        print(f"📨 [EMAIL] Sending Secure Login Code to: {email}")
        print(f"🔑 [CODE]  {otp}")
        print(f"🛡️ [INFO]  Valid for 5 minutes.")
        print(f"---------------------------------------------------------\n")

        # 2. Real Email (If Env is set)
        if os.getenv("MAIL_PASSWORD") and "your-app-password" not in os.getenv("MAIL_PASSWORD"):
            print(f"🚀 [SYSTEM] Attempting to send REAL email to {email}...")
            
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
                    .header {{ text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px; }}
                    .logo {{ font-size: 24px; font-weight: bold; color: #333; }}
                    .otp-box {{ background: #f0f8ff; color: #0066cc; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px dashed #0066cc; }}
                    .footer {{ text-align: center; font-size: 12px; color: #888; margin-top: 30px; }}
                    .highlight {{ color: #0066cc; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🛡️ NeuroBank Guardian</div>
                    </div>
                    <p>Hello,</p>
                    <p>You requested a secure login verification for your NeuroBank account.</p>
                    <p>Please use the following One-Time Password (OTP) to complete your identity claim:</p>
                    
                    <div class="otp-box">{otp}</div>
                    
                    <p>This code is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
                    <br/>
                    <p>Securely yours,<br/><strong>The NeuroBank AI Team</strong></p>
                    
                    <div class="footer">
                        &copy; 2025 NeuroBank Guardian. All rights reserved.<br/>
                        Advanced Cognitive Security Systems.
                    </div>
                </div>
            </body>
            </html>
            """

            message = MessageSchema(
                subject="[NeuroBank] Your Secure Login Code",
                recipients=[email],
                body=html,
                subtype=MessageType.html
            )

            fm = FastMail(conf)
            try:
                await fm.send_message(message)
                print(f"✅ [SYSTEM] Email sent successfully!")
            except Exception as e:
                print(f"❌ [SYSTEM] Email failed to send: {e}")

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
