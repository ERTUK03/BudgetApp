from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, transactions, categories, budgets

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BudgetApp API",
    description="REST API for BudgetApp – personal finance tracker",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "budgetapp-api"}
