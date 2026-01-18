from services.transaction_service import TransactionService
from data.mock_data import MOCK_USERS, MOCK_TRANSACTIONS
import asyncio

def seed():
    print("🌱 Initializing Seed Script...")
    service = TransactionService()
    
    print("🔄 Seeding Database...")
    result = service.seed_database()
    
    print(f"✅ Result: {result}")
    print("🎉 Database seeding complete!")

if __name__ == "__main__":
    seed()
