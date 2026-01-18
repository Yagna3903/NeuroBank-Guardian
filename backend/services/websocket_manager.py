from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of WebSockets (in case user has multiple tabs open)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔌 User {user_id} connected via WebSocket.")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"🔌 User {user_id} disconnected.")

    async def send_personal_message(self, message: dict, user_id: str):
        print(f"📡 [WS] Attempting to send message to {user_id}. Active users: {list(self.active_connections.keys())}")
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                    print(f"✅ [WS] Sent to {user_id}")
                except Exception as e:
                    print(f"❌ [WS] Failed to send to {user_id}: {e}")
        else:
            print(f"⚠️ [WS] User {user_id} not connected. Message dropped.")

manager = ConnectionManager()
