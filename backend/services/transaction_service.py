from typing import List, Dict, Any
from repositories.transaction_repository import TransactionRepository
from repositories.user_repository import UserRepository
from services.embedding_service import EmbeddingService
from data.mock_data import MOCK_TRANSACTIONS, MOCK_USERS

class TransactionService:
    def __init__(self):
        self.repository = TransactionRepository()
        self.user_repository = UserRepository()
        self.embedding_service = EmbeddingService()

    def seed_database(self):
        """Seeds the database with mock data and embeddings."""
        print("🚀 Starting database seeding...")
        
        # Seed Users
        self.user_repository.create_many(MOCK_USERS)
        print(f" Seeding {len(MOCK_USERS)} users...")

        self.repository.clear_collection()
        
        transactions_to_insert = []
        for tx in MOCK_TRANSACTIONS:
            try:
                # Generate embedding
                vector_embedding = self.embedding_service.embed_query(tx["description"])
                
                # Create document with embedding
                doc = tx.copy()
                doc["embedding"] = vector_embedding
                transactions_to_insert.append(doc)
            except Exception as e:
                print(f"⚠️ Failed to generate embedding for {tx['merchant']}: {e}")
        
        if transactions_to_insert:
            result = self.repository.create_many(transactions_to_insert)
            return {
                "message": f"Successfully inserted {len(MOCK_USERS)} users and {len(result.inserted_ids)} transactions."
            }
        return {"message": "Users inserted, but no transactions inserted."}


    async def add_transaction(self, transaction: Dict[str, Any], user_id: str):
        """Adds a new transaction and notifies the user via WebSocket."""
        # 1. Generate Embedding
        try:
            vector_embedding = self.embedding_service.embed_query(transaction["description"])
            transaction["embedding"] = vector_embedding
        except Exception as e:
            print(f"⚠️ Failed to generate embedding: {e}")
            transaction["embedding"] = []

        # 2. Insert into DB
        transaction["user_id"] = user_id
        result = self.repository.create_many([transaction]) # reusing create_many for single insert for now
        
        # 3. Broadcast Update AND Persist to DB
        from services.websocket_manager import manager
        
        # Fetch updated user profile (e.g. balance)
        user = self.user_repository.get_user(user_id)
        if user:
            # Simple logic: deduct amount from first account found (usually Chequing)
            # In a real app, you'd specify which account ID to deduct from
            account = user.get("accounts", [{}])[0]
            account_type = account.get("type", "chequing")
            current_balance = account.get("balance", 0)
            
            new_balance = current_balance - transaction.get("amount", 0)
            
            # --- CRITICAL FIX: Persist new balance to Database ---
            # This ensures that when the Avatar retrieves the user profile ("Where vector search is going on"),
            # it sees the UPDATED balance, not the stale one.
            self.user_repository.update_account_balance(user_id, account_type, new_balance)
            
            update_payload = {
                "type": "balance_update",
                "new_balance": new_balance,
                "latest_transaction": {
                    "merchant": transaction["merchant"],
                    "amount": transaction["amount"]
                }
            }
            print(f"📡 Broadcasting update to {user_id}: {update_payload}")
            await manager.send_personal_message(update_payload, user_id)
            
        return result

    def search_transactions(self, query: str, user_id: str = None) -> List[Dict[str, Any]]:
        """Semantic search for transactions."""
        query_embedding = self.embedding_service.embed_query(query)
        return self.repository.vector_search(query_embedding, user_id=user_id)
