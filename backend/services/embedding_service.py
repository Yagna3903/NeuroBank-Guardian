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

