from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

class OTPRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    code: str

    otp = auth_service.generate_otp(request.email)
    if not otp:
        raise HTTPException(status_code=404, detail="Email not linked to any NeuroBank account.")
        
    await auth_service.send_otp(request.email, otp)
    
    return {"message": "OTP sent successfully. Check your secure inbox (terminal)."}

@router.post("/auth/login")
async def login_with_otp(request: LoginRequest):
    """Verifies OTP and returns user session."""
    user = auth_service.verify_otp(request.email, request.code)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
        
    return {
        "message": "Authentication Successful",
        "user_id": user["user_id"],
        "name": user["name"],
        "token": "mock-jwt-token-for-demo-12345"
    }
