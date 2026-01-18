from langchain_openai import OpenAIEmbeddings
from config.settings import settings

class EmbeddingService:
    def __init__(self):
        # Using 768 dimensions to match MongoDB vector index
        # (originally created for Google's embedding-001 model)
        self.embeddings_model = OpenAIEmbeddings(
            model="text-embedding-3-small",
            dimensions=768,
            openai_api_key=settings.OPENAI_API_KEY
        )

    def embed_query(self, text: str):
        return self.embeddings_model.embed_query(text)
    
    def embed_documents(self, texts: list[str]):
        return self.embeddings_model.embed_documents(texts)


    def embed_transaction(self, transaction: dict):
        """Creates an embedding for a transaction object."""
        text = f"{transaction['date']} {transaction['merchant']} {transaction['amount']} {transaction['category']} {transaction['description']}"
        return self.embed_query(text)

    # Placeholder for vector store update
    async def add_to_vector_store(self, transaction: dict):
        """Encodes and adds a new transaction to the vector database."""
        vector = self.embed_transaction(transaction)
        # In a real app, you would push this 'vector' + 'metadata' to Pinecone/MongoDB Atlas
        print(f"✅ [VECTOR DB] Added new transaction vector for {transaction['merchant']}")
