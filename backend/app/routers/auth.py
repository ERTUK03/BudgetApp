from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Registration
@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Default categories
    defaults = [
        ("🍔", "Food & Drinks", "#f97316", "expense"),
        ("🚗", "Transport", "#3b82f6", "expense"),
        ("🏠", "Housing", "#8b5cf6", "expense"),
        ("🎮", "Entertainment", "#ec4899", "expense"),
        ("💊", "Health", "#10b981", "expense"),
        ("💰", "Salary", "#22c55e", "income"),
        ("📈", "Investments", "#06b6d4", "income"),
        ("🎁", "Other Income", "#f59e0b", "income"),
    ]
    for icon, name, color, t in defaults:
        db.add(models.Category(name=name, icon=icon, color=color, type=t, user_id=user.id))
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

# Log in
@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

# Me
@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
