from fastapi import APIRouter, HTTPException
from repositories.user_repository import UserRepository
from repositories.transaction_repository import TransactionRepository

router = APIRouter()
user_repository = UserRepository()
transaction_repository = TransactionRepository()

@router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    user = user_repository.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate Total Balance
    total_balance = sum(acc["balance"] for acc in user.get("accounts", []))
    
    # Fetch recent transactions
    recent_transactions = transaction_repository.get_recent_transactions(user_id, limit=5)
    
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "risk_score": user.get("risk_score", 0),
        "credit_score": user.get("credit_score", None),
        "total_balance": total_balance,
        "accounts": user.get("accounts", []),
        "credit_cards": user.get("credit_cards", []),
        "recent_transactions": recent_transactions
    }
