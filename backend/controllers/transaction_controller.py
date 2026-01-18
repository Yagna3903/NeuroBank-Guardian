from fastapi import APIRouter, HTTPException, Query
from services.transaction_service import TransactionService
from typing import List, Dict, Any

router = APIRouter()
transaction_service = TransactionService()

@router.post("/seed")
async def seed_data():
    """Endpoint to seed the database with mock transactions."""
    try:
        result = transaction_service.seed_database()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_transactions(query: str = Query(..., description="Natural language query")):
    """Endpoint to search transactions using natural language."""
    try:
        results = transaction_service.search_transactions(query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
