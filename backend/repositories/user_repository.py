from typing import List, Dict, Any
from config.database import Database
from config.settings import settings

class UserRepository:
    def __init__(self):
        self.collection = Database.get_collection("users")

    def create_many(self, users: List[Dict[str, Any]]):
        """Bulk inserts users."""
        self.collection.delete_many({})  # Clear for demo
        return self.collection.insert_many(users)

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Retrieves a user by user_id."""
        return self.collection.find_one({"user_id": user_id})

    def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Retrieves a user by email."""
        return self.collection.find_one({"email": email})

    def update_account_balance(self, user_id: str, account_type: str, new_balance: float):
        """Updates the balance of a specific account for a user."""
        self.collection.update_one(
            {"user_id": user_id, "accounts.type": account_type},
            {"$set": {"accounts.$.balance": new_balance}}
        )

    def update_user(self, user_id: str, updates: Dict[str, Any]):
        """Generic update for user document fields."""
        self.collection.update_one({"user_id": user_id}, {"$set": updates})
