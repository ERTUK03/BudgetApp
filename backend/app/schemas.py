from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from .models import TransactionType

# Authorization
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Categories
class CategoryCreate(BaseModel):
    name: str
    icon: str = "💰"
    color: str = "#6366f1"
    type: TransactionType

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    type: TransactionType
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

# Transactions
class TransactionCreate(BaseModel):
    title: str
    amount: float
    type: TransactionType
    note: str = ""
    date: datetime
    category_id: Optional[int] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    note: Optional[str] = None
    date: Optional[datetime] = None
    category_id: Optional[int] = None

class TransactionOut(BaseModel):
    id: int
    title: str
    amount: float
    type: TransactionType
    note: str
    date: datetime
    category_id: Optional[int]
    category: Optional[CategoryOut]
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class TransactionList(BaseModel):
    items: List[TransactionOut]
    total: int
    page: int
    per_page: int
    pages: int

# Budgets
class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int
    category_id: Optional[int] = None

    @field_validator("month")
    @classmethod
    def month_valid(cls, v):
        if not (1 <= v <= 12):
            raise ValueError("Month must be between 1 and 12")
        return v

class BudgetOut(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category_id: Optional[int]
    category: Optional[CategoryOut]
    user_id: int

    model_config = {"from_attributes": True}

# Summaries
class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: float
    total_expense: float
    balance: float
    by_category: List[dict]
