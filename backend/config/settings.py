import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    AZURE_SPEECH_KEY: str = os.getenv("AZURE_SPEECH_KEY")
    AZURE_SPEECH_REGION: str = os.getenv("AZURE_SPEECH_REGION")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    
    DB_NAME: str = "neurobank"
    COLLECTION_NAME: str = "transactions"

    def validate(self):
        if not self.MONGO_URI:
            raise ValueError("MONGO_URI is not set in environment variables")
        if not self.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set in environment variables")
        if not self.AZURE_SPEECH_KEY:
             pass # Optional for now to avoid crashing if user hasn't added it yet
        if not self.AZURE_SPEECH_REGION:
             pass

        
        # Debug Print (Masked)
        masked_key = f"{self.GOOGLE_API_KEY[:5]}...{self.GOOGLE_API_KEY[-4:]}" if self.GOOGLE_API_KEY else "None"
        print(f"🔧 Configuration Loaded: Key={masked_key}")

settings = Settings()
try:
    settings.validate()
except ValueError as e:
    print(f"Configuration Warning: {e}")
