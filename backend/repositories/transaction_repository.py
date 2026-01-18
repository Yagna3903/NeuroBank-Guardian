from typing import List, Dict, Any
from config.database import Database
from config.settings import settings

class TransactionRepository:
    def __init__(self):
        self.collection = Database.get_collection(settings.COLLECTION_NAME)

    def create_many(self, transactions: List[Dict[str, Any]]):
        """Bulk inserts transactions."""
        # Clean collection for demo purposes (optional, good for seeding)
        # self.collection.delete_many({}) 
        return self.collection.insert_many(transactions)
    
    def clear_collection(self):
         self.collection.delete_many({})

    def vector_search(self, query_embedding: List[float], user_id: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Performs vector search using the defined index."""
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": limit,
                    "filter": {"user_id": {"$eq": user_id}} if user_id else {}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "user_id": 1,
                    "amount": 1,
                    "merchant": 1,
                    "date": 1,
                    "category": 1,
                    "description": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        return list(self.collection.aggregate(pipeline))

    def get_recent_transactions(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetches recent transactions sorted by date."""
        return list(self.collection.find(
            {"user_id": user_id},
            {"_id": 0, "embedding": 0}
        ).sort("date", -1).limit(limit))
