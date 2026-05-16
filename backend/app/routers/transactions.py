from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
import math

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=schemas.TransactionList)
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)

    if type:
        q = q.filter(models.Transaction.type == type)
    if category_id:
        q = q.filter(models.Transaction.category_id == category_id)
    if month:
        q = q.filter(extract("month", models.Transaction.date) == month)
    if year:
        q = q.filter(extract("year", models.Transaction.date) == year)

    total = q.count()
    items = q.order_by(models.Transaction.date.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, math.ceil(total / per_page)),
    }


@router.post("", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(
    data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if data.category_id:
        cat = db.query(models.Category).filter(
            models.Category.id == data.category_id,
            models.Category.user_id == current_user.id,
        ).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")

    tx = models.Transaction(**data.model_dump(), user_id=current_user.id)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/summary/monthly", response_model=schemas.MonthlySummary)
def monthly_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).all()

    total_income = sum(t.amount for t in txs if t.type == "income")
    total_expense = sum(t.amount for t in txs if t.type == "expense")

    by_cat: dict = {}
    for t in txs:
        key = t.category_id or 0
        label = t.category.name if t.category else "Uncategorized"
        icon = t.category.icon if t.category else "❓"
        color = t.category.color if t.category else "#888"
        if key not in by_cat:
            by_cat[key] = {"category_id": key, "name": label, "icon": icon, "color": color, "income": 0.0, "expense": 0.0}
        by_cat[key][t.type] += t.amount

    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "by_category": list(by_cat.values()),
    }


@router.get("/{tx_id}", response_model=schemas.TransactionOut)
def get_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.patch("/{tx_id}", response_model=schemas.TransactionOut)
def update_transaction(
    tx_id: int,
    data: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=204)
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()



