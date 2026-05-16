FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create data dir for SQLite
RUN mkdir -p /data

ENV DATABASE_URL=sqlite:////data/budgetapp.db
ENV SECRET_KEY=changeme-set-via-env

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
