from fastapi import APIRouter, HTTPException
from repositories.user_repository import UserRepository

router = APIRouter()
user_repository = UserRepository()

@router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    user = user_repository.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate Total Balance
    total_balance = sum(acc["balance"] for acc in user.get("accounts", []))
    
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "risk_score": user["risk_score"],
        "total_balance": total_balance,
        "accounts": user.get("accounts", [])
    }
