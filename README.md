# \# BudgetApp – Personalny Tracker Finansów

# 

# \## 1. Opis aplikacji

# 

# \*\*BudgetApp\*\* to aplikacja do zarządzania budżetem osobistym. Umożliwia śledzenie przychodów i wydatków, kategoryzowanie transakcji, przeglądanie statystyk miesięcznych oraz planowanie budżetu. System działa jako trio: backend API + aplikacja PWA + aplikacja mobilna.

# 

# \*\*Grupa docelowa:\*\* Osoby prywatne chcące kontrolować swoje finanse na różnych urządzeniach.

# 

# \*\*Główne funkcjonalności:\*\*

# \- Rejestracja i logowanie (JWT, te same dane w PWA i mobile)

# \- Dodawanie/edycja/usuwanie transakcji (przychody i wydatki)

# \- Kategorie z ikonami emoji i kolorami

# \- Statystyki miesięczne z wykresami (wykres kołowy, słupkowy)

# \- Tryb offline w PWA (Service Worker + kolejka synchronizacji)

# \- Natywna funkcja mobilna: \*\*geolokalizacja\*\* (zapisywanie miejsca transakcji)

# 

# \---

# 

# \## 2. Architektura systemu

# 

# ```

# ┌─────────────┐        REST API (JSON)       ┌─────────────────────┐

# │  PWA React  │ ◄──────────────────────────► │  FastAPI Backend     │

# │  (Vercel)   │                               │  (Railway)          │

# └─────────────┘                               │                     │

# &#x20;                                             │  SQLite DB          │

# ┌─────────────┐        REST API (JSON)        │                     │

# │ React Native│ ◄──────────────────────────► │                     │

# │  Expo (APK) │                               └─────────────────────┘

# └─────────────┘

# 

# Offline:

# &#x20; PWA → Service Worker + localStorage queue

# &#x20; Mobile → AsyncStorage local cache

# ```

# 

# \---

# 

# \## 3. Stos technologiczny

# 

# | Warstwa | Technologia | Uzasadnienie |

# |---|---|---|

# | Backend | \*\*FastAPI\*\* (Python) | Szybki development, automatyczny Swagger, async support |

# | Baza danych | \*\*SQLite\*\* + SQLAlchemy | Bezserwerowa, zero konfiguracji |

# | PWA | \*\*React + Vite + vite-plugin-pwa\*\* | Prosty Service Worker |

# | Mobile | \*\*React Native + Expo\*\* | Cross-platform z JavaScript, natywne API (Geolocation, SecureStore), łatwy build przez EAS |

# | Deploy backend | \*\*Railway\*\* | Automatyczny CI/CD z GitHub, darmowy, HTTPS |

# | Deploy PWA | \*\*Vercel\*\* | Darmowy hosting, automatyczny CI/CD z GitHub |

# 

# \---

# 

# \## 4. Opis API

# 

# Pełna dokumentacja: https://budgetapp-production-1afe.up.railway.app/docs (Swagger UI)

# 

# | Endpoint | Metoda | Opis |

# |---|---|---|

# | `/api/auth/register` | POST | Rejestracja użytkownika |

# | `/api/auth/login` | POST | Logowanie, zwraca JWT |

# | `/api/auth/me` | GET | Dane zalogowanego użytkownika |

# | `/api/transactions` | GET | Lista transakcji (paginacja, filtry) |

# | `/api/transactions` | POST | Utwórz transakcję |

# | `/api/transactions/{id}` | PATCH | Edytuj transakcję |

# | `/api/transactions/{id}` | DELETE | Usuń transakcję |

# | `/api/transactions/summary/monthly` | GET | Podsumowanie miesiąca |

# | `/api/categories` | GET | Lista kategorii użytkownika |

# | `/api/categories` | POST | Utwórz kategorię |

# | `/api/categories/{id}` | DELETE | Usuń kategorię |

# | `/api/budgets` | GET | Budżety na miesiąc |

# | `/api/budgets` | POST | Ustaw budżet |

# 

# Wszystkie endpointy (oprócz auth) wymagają nagłówka `Authorization: Bearer <token>`.

# 

# \---

# 

# \## 5. Design System

# 

# | Token | Wartość |

# |---|---|

# | Tło główne | `#080c14` |

# | Tło kart | `#0f1623` |

# | Tło inputów | `#161e2e` |

# | Obramowanie | `#1e2d45` |

# | Tekst główny | `#e2eaf4` |

# | Tekst drugorzędny | `#7a92b0` |

# | Akcent (niebieski) | `#3b82f6` |

# | Zielony (przychody) | `#22c55e` |

# | Czerwony (wydatki) | `#ef4444` |

# | Żółty (ostrzeżenia) | `#f59e0b` |

# 

# \---

# 

# \## 6. Zabezpieczenia

# 

# \- \*\*JWT\*\* (HS256, 7-dniowy token) — wszystkie endpointy API poza auth są zabezpieczone

# \- \*\*Bcrypt\*\* — hashowanie haseł (passlib)

# \- \*\*CORS\*\* — skonfigurowany w FastAPI

# \- \*\*Walidacja danych\*\* — Pydantic v2 (typy, zakresy, email)

# \- \*\*HTTPS\*\* — wymuszone przez hosting (Vercel/Railway)

# \- \*\*SecureStore\*\* w Expo — token JWT przechowywany w bezpiecznym magazynie urządzenia

# \- \*\*XSS\*\* — React escapuje dane z API domyślnie

# 

# \---

# 

# \## 7. Instrukcja uruchomienia

# 

# \### Backend (lokalnie z Docker)

# 

# ```bash

# cd budgetapp

# docker-compose up -d

# \# API dostępne na http://localhost:8000

# \# Swagger UI: http://localhost:8000/docs

# ```

# 

# \### Backend (produkcja)

# Działa automatycznie na Railway: https://budgetapp-production-1afe.up.railway.app

# 

# \### PWA (lokalnie)

# 

# ```bash

# cd pwa

# npm install

# npm run dev       # dev: http://localhost:5173

# npm run build     # produkcja w dist/

# ```

# 

# Plik `pwa/.env`:

# ```

# VITE\_API\_URL=https://budgetapp-production-1afe.up.railway.app

# ```

# 

# \### PWA (produkcja)

# Dostępna na Vercel — automatyczny deploy z GitHub.

# 

# \### Aplikacja mobilna (React Native + Expo)

# 

# \#### Uruchomienie lokalnie

# ```bash

# cd mobile

# npm install

# npx expo start

# ```

# 

# \#### Budowanie APK przez EAS

# ```bash

# cd mobile

# eas build -p android --profile preview

# ```

# 

# Pobierz APK z: https://expo.dev/accounts/ertuk03/projects/budgetapp-mobile/builds

# 

# \#### Instalacja na emulatorze/urządzeniu

# ```powershell

# \# Uruchomienie emulatora

# E:\\Android\\emulator\\emulator.exe -avd Pixel5 -no-metrics -no-snapshot-load

# 

# \# Instalacja APK

# E:\\Android\\platform-tools\\adb.exe install -r nazwa\_pliku.apk

# ```

# 

# \---

# 

# \## 8. Struktura repozytorium

# 

# ```

# budgetapp/

# ├── backend/

# │   ├── app/

# │   │   ├── main.py          # FastAPI app, CORS, routing

# │   │   ├── database.py      # SQLAlchemy + SQLite

# │   │   ├── models.py        # ORM modele (User, Category, Transaction, Budget)

# │   │   ├── schemas.py       # Pydantic schematy

# │   │   ├── auth.py          # JWT utilities

# │   │   └── routers/         # auth, transactions, categories, budgets

# │   ├── Dockerfile

# │   └── requirements.txt

# ├── pwa/

# │   ├── src/

# │   │   ├── pages/           # Login, Register, Dashboard, Transactions, Categories

# │   │   ├── components/      # Layout (sidebar, offline banner)

# │   │   ├── contexts/        # AuthContext (JWT state)

# │   │   ├── services/        # api.js (fetch + offline queue)

# │   │   └── styles.css       # Design system

# │   ├── vite.config.js       # PWA plugin + proxy

# │   └── index.html

# ├── mobile/

# │   ├── app/

# │   │   ├── \_layout.js       # Root layout z auth

# │   │   ├── login.js         # Ekran logowania

# │   │   ├── register.js      # Ekran rejestracji

# │   │   └── (tabs)/          # Dashboard, Transactions, Add, Categories

# │   ├── services/

# │   │   ├── api.js           # REST API client

# │   │   └── AuthContext.js   # Auth state z SecureStore

# │   ├── app.json             # Konfiguracja Expo

# │   ├── eas.json             # Konfiguracja EAS Build

# │   └── package.json

# ├── .github/workflows/       # GitHub Actions (EAS Build)

# └── docker-compose.yml

# ```

# 

# \---

# 

# \## 9. Możliwości rozwoju

# 

# \- Push notifications (przypomnienia o przekroczeniu budżetu)

# \- Eksport do CSV/PDF

# \- Wiele walut z przeliczaniem

# \- Cele oszczędnościowe

# \- Wykresy trendów miesięcznych (ostatnie 6/12 miesięcy)



