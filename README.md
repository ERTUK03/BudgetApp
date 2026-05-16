# 💰 BudgetApp – Personalny Tracker Finansów

Projekt semestralny — Projektowanie i programowanie aplikacji PWA i mobilnych cross-platform

---

## 1. Opis aplikacji

**BudgetApp** to aplikacja do zarządzania budżetem osobistym. Umożliwia śledzenie przychodów
i wydatków, kategoryzowanie transakcji, przeglądanie statystyk miesięcznych oraz planowanie
budżetu. System działa jako trio: backend API + aplikacja PWA + aplikacja mobilna (Android).

**Grupa docelowa:** Osoby prywatne chcące kontrolować swoje finanse na każdym urządzeniu.

**Główne funkcjonalności:**
- Rejestracja i logowanie (JWT, te same dane w PWA i mobile)
- Dodawanie/edycja/usuwanie transakcji (przychody i wydatki)
- Kategorie z ikonami emoji i kolorami
- Statystyki miesięczne z wykresami (wykres kołowy, słupkowy)
- Tryb offline w PWA (Service Worker + kolejka synchronizacji)
- Tryb offline w aplikacji mobilnej (SQLite cache + pending queue)
- Natywna funkcja mobilna: **geolokalizacja** (zapisywanie miejsca transakcji)

---

## 2. Architektura systemu

```
┌─────────────┐        REST API (JSON)       ┌─────────────────────┐
│  PWA React  │ ◄──────────────────────────► │  FastAPI Backend     │
│  (Vercel)   │                               │  (Docker/Railway)   │
└─────────────┘                               │                     │
                                              │  SQLite DB          │
┌─────────────┐        REST API (JSON)       │  (persistent vol.)  │
│ .NET MAUI   │ ◄──────────────────────────► │                     │
│  (Android)  │                               └─────────────────────┘
└─────────────┘

Offline:
  PWA → Service Worker (NetworkFirst) + localStorage queue
  MAUI → SQLite local cache + pending sync queue
```

---

## 3. Stos technologiczny

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Backend | **FastAPI** (Python) | Szybki development, automatyczny Swagger, async support |
| Baza danych | **SQLite** + SQLAlchemy | Bezserwerowa, zero konfiguracji, idealna dla projektu solo |
| PWA | **React + Vite + vite-plugin-pwa** | Najlepsza ekosystem, najszybszy HMR, prosty Service Worker |
| Mobile | **.NET MAUI** | Cross-platform z C#, natywne API (Geolocation, SecureStorage) |
| Deploy backend | **Docker** | Izolacja, powtarzalność, łatwy deploy na każdym VPS |
| Deploy PWA | **Vercel** | Darmowy hosting, automatyczny CI/CD z GitHub |

---

## 4. Opis API

Pełna dokumentacja: `http://localhost:8000/docs` (Swagger UI)

| Endpoint | Metoda | Opis |
|---|---|---|
| `/api/auth/register` | POST | Rejestracja użytkownika |
| `/api/auth/login` | POST | Logowanie, zwraca JWT |
| `/api/auth/me` | GET | Dane zalogowanego użytkownika |
| `/api/transactions` | GET | Lista transakcji (paginacja, filtry) |
| `/api/transactions` | POST | Utwórz transakcję |
| `/api/transactions/{id}` | PATCH | Edytuj transakcję |
| `/api/transactions/{id}` | DELETE | Usuń transakcję |
| `/api/transactions/summary/monthly` | GET | Podsumowanie miesiąca |
| `/api/categories` | GET | Lista kategorii użytkownika |
| `/api/categories` | POST | Utwórz kategorię |
| `/api/categories/{id}` | DELETE | Usuń kategorię |
| `/api/budgets` | GET | Budżety na miesiąc |
| `/api/budgets` | POST | Ustaw budżet |

Wszystkie endpointy (oprócz auth) wymagają nagłówka `Authorization: Bearer <token>`.

---

## 5. Design System

| Token | Wartość |
|---|---|
| Tło główne | `#080c14` |
| Tło kart | `#0f1623` |
| Tło inputów | `#161e2e` |
| Obramowanie | `#1e2d45` |
| Tekst główny | `#e2eaf4` |
| Tekst drugorzędny | `#7a92b0` |
| Akcent (niebieski) | `#3b82f6` |
| Zielony (przychody) | `#22c55e` |
| Czerwony (wydatki) | `#ef4444` |
| Żółty (ostrzeżenia) | `#f59e0b` |

**Typografia:** Syne (nagłówki, UI) + DM Mono (kwoty, dane numeryczne)

---

## 6. Zabezpieczenia

- **JWT** (HS256, 7-dniowy token) — wszystkie endpointy API poza auth są zabezpieczone
- **Bcrypt** — hashowanie haseł (passlib)
- **CORS** — skonfigurowany w FastAPI
- **Walidacja danych** — Pydantic v2 (typy, zakresy, email)
- **HTTPS** — wymuszone przez hosting (Vercel/Railway)
- **SecureStorage** w MAUI — token JWT przechowywany w bezpiecznym magazynie urządzenia
- **XSS** — React escapuje dane z API domyślnie

---

## 7. Instrukcja uruchomienia

### Backend (Docker)

```bash
cd budgetapp
docker-compose up -d
# API dostępne na http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

### Backend (lokalnie bez Docker)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### PWA

```bash
cd pwa
npm install
npm run dev       # dev: http://localhost:5173
npm run build     # produkcja w dist/
```

Zmień URL backendu w `pwa/.env`:
```
VITE_API_URL=https://twoj-backend.railway.app
```

### Aplikacja mobilna (.NET MAUI)

```bash
cd mobile/BudgetApp
dotnet restore
dotnet build -t:Run -f net9.0-android
```

Zmień `BaseUrl` w `Services/ApiService.cs`:
- Emulator Android: `http://10.0.2.2:8000`
- Urządzenie fizyczne: `http://<IP-komputera>:8000`
- Produkcja: `https://twoj-backend.railway.app`

---

## 8. Struktura repozytorium

```
budgetapp/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routing
│   │   ├── database.py      # SQLAlchemy + SQLite
│   │   ├── models.py        # ORM modele (User, Category, Transaction, Budget)
│   │   ├── schemas.py       # Pydantic schematy
│   │   ├── auth.py          # JWT utilities
│   │   └── routers/         # auth, transactions, categories, budgets
│   ├── Dockerfile
│   └── requirements.txt
├── pwa/
│   ├── src/
│   │   ├── pages/           # Login, Register, Dashboard, Transactions, Categories
│   │   ├── components/      # Layout (sidebar, offline banner)
│   │   ├── contexts/        # AuthContext (JWT state)
│   │   ├── services/        # api.js (fetch + offline queue)
│   │   └── styles.css       # Design system
│   ├── vite.config.js       # PWA plugin + proxy
│   └── index.html
├── mobile/BudgetApp/
│   ├── Models/              # DTOs + SQLite cache model
│   ├── Services/            # ApiService, AuthService, LocalDbService
│   ├── Pages/               # Login, Register, Dashboard, Transactions, AddTransaction
│   └── BudgetApp.csproj
└── docker-compose.yml
```

---

## 9. Możliwości rozwoju

- Push notifications (przypomnienia o przekroczeniu budżetu)
- Eksport do CSV/PDF
- Wiele walut z przeliczaniem
- Cele oszczędnościowe
- WebSocket dla aktualizacji w czasie rzeczywistym
- Biometryczne logowanie w MAUI
- Wykresy trendów miesięcznych (ostatnie 6/12 miesięcy)
- Import wyciągu bankowego (CSV)
