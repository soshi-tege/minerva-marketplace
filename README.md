# Minerva Marketplace

A peer-to-peer marketplace for Minerva University students to buy, sell, and request items within the Minerva community. Built with Flask (backend) and React (frontend).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│                     React (port 3000)                   │
│                                                         │
│  Pages          Components       Services               │
│  ┌───────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │ Home      │  │ Header     │  │ authService.js   │   │
│  │ Items     │  │ ItemCard   │  │ itemService.js   │   │
│  │ Item      │  │ StatBox    │  │ api.js           │   │
│  │ Post      │  │ SectionCard│  │                  │   │
│  │ Dashboard │  │ Button     │  │ config.js        │   │
│  │ Messages  │  │ Body       │  │  └─ API_BASE     │   │
│  │ Login     │  │ Heading    │  │  └─ API_ORIGIN   │   │
│  │ Signup    │  │ Protected  │  └──────────────────┘   │
│  └───────────┘  │  Route     │                          │
│                 └────────────┘  Context                  │
│                                 ┌──────────────────┐    │
│                                 │ AuthContext.js    │    │
│                                 │  └─ JWT in        │    │
│                                 │     localStorage  │    │
│                                 └──────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (JSON + multipart/form-data)
                         │ Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────┐
│                        Backend                          │
│                   Flask (port 5001)                      │
│                                                         │
│  app.py (factory)                                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ create_app() ──► db.init_app + JWTManager + CORS│    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Routes (HTTP only)         Services (business logic)   │
│  ┌───────────────────┐     ┌───────────────────────┐   │
│  │ auth.py           │────►│ auth_service.py        │   │
│  │  POST /signup     │     │  signup(), login()     │   │
│  │  POST /login      │     │  is_minerva_email()    │   │
│  ├───────────────────┤     ├───────────────────────┤   │
│  │ items.py          │────►│ item_service.py        │   │
│  │  GET    /items    │     │  list_items()          │   │
│  │  GET    /items/:id│     │  create_item()         │   │
│  │  POST   /items    │     │  update_item()         │   │
│  │  PUT    /items/:id│     │  delete_item()         │   │
│  │  DELETE /items/:id│     │  validate_item_data()  │   │
│  │  GET /categories  │     │  get_categories()      │   │
│  │  GET /cities      │     │  get_cities()          │   │
│  ├───────────────────┤     ├───────────────────────┤   │
│  │ messages.py       │────►│ message_service.py     │   │
│  │  GET  /conversations     │     │  get_conversations()   │   │
│  │  POST /conversations     │     │  start_conversation()  │   │
│  │  GET  /conversations/:id │     │  get_messages()        │   │
│  │  POST /conversations/:id │     │  send_message()        │   │
│  │  GET /unread-count│     │  get_unread_count()    │   │
│  ├───────────────────┤     └───────────────────────┘   │
│  │ dashboard.py      │                                  │
│  │  GET /me/dashboard│──► queries Items + msg_service   │
│  └───────────────────┘                                  │
│                                                         │
│  Models (data layer)                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ User ──< Item                                    │    │
│  │ User ──< Conversation >── Item                   │    │
│  │ Conversation ──< Message                         │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│                    SQLite (dev)                          │
│                 PostgreSQL (prod)                        │
└─────────────────────────────────────────────────────────┘
```

### Separation of Concerns

The backend follows a three-layer architecture:

- **Routes** handle HTTP: parse requests, check auth, return JSON responses. Most routes delegate business logic to services; `dashboard.py` is a current exception that queries the Item model directly alongside service calls.
- **Services** contain all business logic: validation, querying, filtering, sorting. No HTTP or Flask request/response objects.
- **Models** define the database schema via SQLAlchemy ORM. Provide `to_dict()` serialization methods.

The frontend separates concerns similarly:

- **Pages** are route-level components that compose UI and call services.
- **Components** are reusable UI elements with no API knowledge.
- **Services** abstract all API calls behind named functions.
- **Context** (AuthContext) manages auth state and JWT storage.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2 |
| Routing | React Router | 7.13 |
| Backend | Flask | 3.1 |
| ORM | Flask-SQLAlchemy | 3.1 |
| Auth | Flask-JWT-Extended | 4.7 |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Migrations | Flask-Migrate (Alembic) | 4.1 |
| CORS | Flask-CORS | 5.0 |

## Database Schema

```
┌──────────────────┐     ┌──────────────────────────────┐
│ users            │     │ items                         │
├──────────────────┤     ├──────────────────────────────┤
│ id (PK)          │◄──┐ │ id (PK)                      │
│ email (unique)   │   │ │ seller_id (FK → users.id)    │
│ password_hash    │   ├─│ title                        │
│ first_name       │   │ │ description                  │
│ last_name        │   │ │ price (integer, cents)       │
│ city             │   │ │ currency (default "USD")     │
│ cohort           │   │ │ category                     │
│ created_at       │   │ │ condition                    │
│ updated_at       │   │ │ listing_type (offering/request)│
└──────────────────┘   │ │ status (active/sold)         │
                       │ │ location                     │
┌──────────────────┐   │ │ image_url                    │
│ conversations    │   │ │ created_at                   │
├──────────────────┤   │ │ updated_at                   │
│ id (PK)          │   │ └──────────────────────────────┘
│ item_id (FK)─────┼───┤
│ buyer_id (FK)────┼───┤ ┌──────────────────┐
│ seller_id (FK)───┼───┘ │ messages         │
│ created_at       │     ├──────────────────┤
│                  │◄────│ conversation_id  │
└──────────────────┘     │ sender_id (FK)   │
                         │ body             │
                         │ created_at       │
                         └──────────────────┘
```

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account (Minerva email required) |
| POST | `/api/auth/login` | No | Login, returns JWT |

### Items (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/items` | No | List items (supports `?q=`, `?category=`, `?city=`, `?listing_type=`, `?sort=newest\|oldest\|price_asc\|price_desc`, `?page=`, `?per_page=`) |
| GET | `/api/items/:id` | No | Get single item with seller info |
| POST | `/api/items` | JWT | Create item (JSON or multipart with image) |
| PUT | `/api/items/:id` | JWT | Update item (owner only) |
| DELETE | `/api/items/:id` | JWT | Delete item (owner only) |
| GET | `/api/categories` | No | List valid categories |
| GET | `/api/cities` | No | List cities with active listings |

### Messages (`/api/messages`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/conversations` | JWT | List user's conversations |
| POST | `/api/messages/conversations` | JWT | Start conversation about an item |
| GET | `/api/messages/conversations/:id` | JWT | Get messages in conversation |
| POST | `/api/messages/conversations/:id` | JWT | Send message |
| GET | `/api/messages/unread-count` | JWT | Get unread message count |

### Dashboard (`/api/me`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/me/dashboard` | JWT | User's listings, stats, recent messages |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Returns `{"status": "ok"}` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///app.db` | Database connection string |
| `JWT_SECRET_KEY` | `dev-secret-change-in-production` | Secret for signing JWTs |
| `REACT_APP_API_ORIGIN` | `http://127.0.0.1:5001` | Backend origin (used to build API_BASE and image URLs) |

## Docker Setup

The project includes Dockerfiles for the backend and frontend, plus a simple `docker-compose.yml` that also starts Postgres.

### Files

- `backend/Dockerfile` builds the Flask API
- `frontend/Dockerfile` builds the React app
- `docker-compose.yml` starts backend, frontend, and Postgres together

### Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts:
- backend on http://localhost:5001
- frontend on http://localhost:3000
- Postgres on port 5433 if you keep the current compose port mapping

### Stop Docker

```bash
docker compose down
```

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
cd ..
python -m backend.app
```

The backend runs on http://localhost:5001. In local non-Docker mode, the default database is SQLite and the database file (`instance/app.db`) is created automatically in the `instance/` directory on first run.

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on http://localhost:3000 and sends API requests directly to the backend at the configured `REACT_APP_API_ORIGIN`.

### Running Both

Open two terminal windows:

```bash
# Terminal 1 — Backend
source venv/bin/activate
python -m backend.app

# Terminal 2 — Frontend
cd frontend
npm start
```

If you are using Docker Compose, use `docker compose up --build` instead of starting the backend and frontend separately.

## Project Structure

```
minerva-marketplace/
├── backend/
│   ├── app.py                 # App factory, blueprint registration
│   ├── models.py              # SQLAlchemy models (User, Item, Conversation, Message)
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py            # Signup/login endpoints
│   │   ├── items.py           # Item CRUD + search/filter
│   │   ├── messages.py        # Messaging endpoints
│   │   └── dashboard.py       # Dashboard summary endpoint
│   ├── services/
│   │   ├── auth_service.py    # Auth logic, email validation, password hashing
│   │   ├── item_service.py    # Item queries, validation, CRUD
│   │   └── message_service.py # Conversation and message logic
│   ├── static/uploads/        # Uploaded item images
│   ├── migrations/            # Alembic migrations
│   └── tests/
│       ├── test_auth.py
│       └── test_items.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js             # Router setup
│   │   ├── config.js          # API_BASE, API_ORIGIN, helpers
│   │   ├── context/
│   │   │   └── AuthContext.js  # Auth state + JWT storage
│   │   ├── components/        # Reusable UI (Header, ItemCard, Button, etc.)
│   │   ├── pages/             # Route-level pages (Home, Items, Post, etc.)
│   │   ├── services/          # API call abstractions
│   │   │   ├── api.js         # Message API calls
│   │   │   ├── authService.js # Login/signup API calls
│   │   │   └── itemService.js # Item listing API calls
│   │   └── index.css          # Global styles with dark mode support
│   └── package.json
└── README.md
```

## Features (Current — MVP 2)

- **Auth**: Signup with Minerva email validation, JWT login, protected routes
- **Listings**: Post items with image upload, edit, mark as sold, delete (owner only)
- **Browse**: Server-side search, category filter, sort (newest/oldest/price), pagination
- **Browse tabs**: Items for Sale and Requests tabs with city filter
- **Seller profiles**: Name, city, cohort, join date on item detail page
- **Messaging**: Start conversations about items, send/receive messages
- **Dashboard**: Active listings, sold items, stats, recent messages
- **Dark mode**: Toggle with persistence in localStorage
- **Mobile responsive**: All pages work on phone screens
- **Empty states**: Helpful messages with CTAs when no data exists
