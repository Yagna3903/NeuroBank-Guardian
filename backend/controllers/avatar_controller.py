from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from services.avatar_service import AvatarService
from services.audio_service import AudioService
import json

router = APIRouter()
avatar_service = AvatarService()
audio_service = AudioService()

@router.post("/session")
async def start_avatar_session():
    """
    Returns an Azure Token and ICE config for the frontend to initialize the Avatar.
    """
    try:
        token = await avatar_service.get_token()
        # ICE config comes from the Relay Token endpoint
        relay_token = await avatar_service.get_relay_token()
        
        return {
            "token": token, 
            "ice_servers": relay_token,
            "region": avatar_service.speech_region
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws")
async def audio_websocket(websocket: WebSocket, user_id: str = "user_001"):
    """
    WebSocket for real-time interaction.
    URL: ws://localhost:8000/api/v1/avatar/ws?user_id=user_001
    
    1. Frontend sends text (STT result from Azure SDK).
    2. Backend acts as the 'Brain': Search Vector DB -> Formulate Response.
    3. Backend sends text back.
    4. Frontend sends text to Avatar to speak.
    """
    await websocket.accept()
    print(f"🔌 WebSocket connected for User: {user_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            
            if message.get("type") == "text_input":
                # Scenario: Frontend does STT, sends text
                text = message.get("text")
                response_text = await audio_service.process_audio_intent(user_id, text)
                await websocket.send_json({
                    "type": "avatar_response",
                    "text": response_text
                })
            
            # Future: Handle binary audio chunks if we move STT to backend
            # elif message.get("type") == "audio_chunk": ...

    except WebSocketDisconnect:
        print("WebSocket disconnected")
