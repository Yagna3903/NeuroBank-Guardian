from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config.settings import settings

class EmbeddingService:
    def __init__(self):
        self.embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.GOOGLE_API_KEY
        )

    def embed_query(self, text: str):
        return self.embeddings_model.embed_query(text)
    
    def embed_documents(self, texts: list[str]):
        return self.embeddings_model.embed_documents(texts)
