from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TransactionBase(BaseModel):
    user_id: str
    amount: float
    merchant: str
    date: datetime
    category: str
    description: str

class TransactionCreate(TransactionBase):
    pass

class TransactionInDB(TransactionBase):
    id: Optional[str] = Field(None, alias="_id")
    embedding: Optional[List[float]] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
