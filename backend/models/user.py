from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Account(BaseModel):
    account_id: str
    type: str  # e.g., "Chequing", "Savings"
    balance: float
    currency: str = "CAD"
    interest_rate: Optional[float] = None
    holdings: Optional[str] = None

class Loan(BaseModel):
    loan_id: str
    type: str  # e.g., "Mortgage", "Personal Line of Credit"
    original_amount: float
    remaining_balance: float
    interest_rate: float
    next_payment_date: datetime

class CreditCard(BaseModel):
    card_id: str
    name: str = "Credit Card"
    limit: float
    current_balance: float
    due_date: datetime

class User(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    risk_score: int  # 0-100, where 100 is safe
    credit_score: Optional[int] = None # Added field
    accounts: List[Account] = []
    loans: List[Loan] = []
    credit_cards: List[CreditCard] = []

class UserInDB(User):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
