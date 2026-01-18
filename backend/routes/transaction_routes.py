from fastapi import APIRouter
from controllers.transaction_controller import router as transaction_router

api_router = APIRouter()
api_router.include_router(transaction_router, tags=["Transactions"])
