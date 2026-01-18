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


    def search_transactions(self, query: str, user_id: str = None) -> List[Dict[str, Any]]:
        """Semantic search for transactions."""
        query_embedding = self.embedding_service.embed_query(query)
        return self.repository.vector_search(query_embedding, user_id=user_id)
