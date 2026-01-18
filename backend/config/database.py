from pymongo import MongoClient
from pymongo.collection import Collection
from config.settings import settings

class Database:
    client: MongoClient = None
    db = None

    @classmethod
    def connect(cls):
        """Establishes connection to MongoDB."""
        if cls.client is None:
            cls.client = MongoClient(settings.MONGO_URI)
            cls.db = cls.client[settings.DB_NAME]
            print(f" Connected to MongoDB: {settings.DB_NAME}")

    @classmethod
    def get_collection(cls, collection_name: str) -> Collection:
        """Returns a MongoDB collection."""
        if cls.db is None:
            cls.connect()
        return cls.db[collection_name]

    @classmethod
    def close(cls):
        """Closes the connection."""
        if cls.client:
            cls.client.close()
            cls.client = None
            print(" MongoDB Connection Closed")
