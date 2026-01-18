import aiohttp
from config.settings import settings

class AvatarService:
    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.speech_region = settings.AZURE_SPEECH_REGION

    async def get_token(self):
        """
        Gets the Speech Service API Token (for the SDK auth).
        """
        if not self.speech_key or not self.speech_region:
            raise ValueError("Azure Speech Key/Region not configured.")

        fetch_token_url = f"https://{self.speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        headers = {
            'Ocp-Apim-Subscription-Key': self.speech_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(fetch_token_url, headers=headers) as response:
                if response.status == 200:
                    token = await response.text()
                    return token
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to issue SDK token: {response.status} - {error_text}")

    async def get_relay_token(self):
        """
        Gets the ICE Server Relay Token (specifically for Real-time Avatar WebRTC).
        Endpoint: /cognitiveservices/avatar/relay/token/v1
        """
        if not self.speech_key or not self.speech_region:
             return None 

        # Note: The host might differ slightly per region, but usually follows this pattern or similar.
        # For standard regions: {region}.tts.speech.microsoft.com
        url = f"https://{self.speech_region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1"
        headers = {
            'Ocp-Apim-Subscription-Key': self.speech_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    # Fallback or log error
                    print(f"⚠️ Failed to get Relay Token: {response.status}")
                    return None

