from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from services.websocket_manager import manager
from services.transaction_service import TransactionService
import asyncio
import json

router = APIRouter()
transaction_service = TransactionService()

@router.websocket("/ws/dashboard/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and listen for any client-side events if needed
            data = await websocket.receive_text()
            
            # Allow client to trigger a 'test' transaction for demo purposes
            message = json.loads(data)
            if message.get("type") == "simulate_transaction":
                new_tx = {
                    "merchant": "Simulated Store",
                    "amount": 50.0,
                    "category": "Shopping",
                    "description": "Real-time purchase simulation",
                    "date": "2024-03-20"
                }
                await transaction_service.add_transaction(new_tx, user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket, user_id)
