# Evolution of Todo - Backend API

Phase II Full-Stack Web Application - Python FastAPI Backend

## Overview

RESTful API backend for todo management with user authentication, database persistence, and user-scoped data isolation.

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI (async REST API)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (Pydantic + SQLAlchemy)
- **Authentication**: JWT-based sessions
- **Testing**: pytest with async support

## Prerequisites

- Python 3.11 or higher
- Neon PostgreSQL account (https://neon.tech/)
- Virtual environment tool (venv)

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
SECRET_KEY=your-secret-key-change-this-in-production
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

**Get DATABASE_URL**:
1. Sign up at https://neon.tech/
2. Create new project
3. Copy connection string
4. Replace `postgresql://` with `postgresql+asyncpg://`

**Generate SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Run Database Migrations

```bash
# Initialize Alembic (if not done)
alembic init migrations

# Generate migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 5. Start Development Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: http://localhost:8000

## API Documentation

Once server is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Authenticate user
- `POST /auth/signout` - End session
- `GET /auth/session` - Check current session

### Todos (Protected)
- `GET /todos` - Get all user's todos
- `POST /todos` - Create new todo
- `GET /todos/{id}` - Get single todo
- `PUT /todos/{id}` - Update todo
- `PATCH /todos/{id}` - Toggle completion
- `DELETE /todos/{id}` - Delete todo

### Health
- `GET /health` - Health check

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/        # API endpoints
│   │   └── middleware/    # Auth, error handling
│   ├── models/            # SQLModel entities
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── core/              # Config, database, security
│   └── main.py            # FastAPI app
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # API tests
│   └── contract/          # Contract tests
├── migrations/            # Alembic migrations
└── requirements.txt       # Python dependencies
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/integration/test_auth_api.py
```

## Code Quality

```bash
# Format code
black src/ tests/

# Lint
flake8 src/ tests/

# Type check
mypy src/
```

## Troubleshooting

**Database Connection Error**:
- Verify DATABASE_URL in .env
- Check Neon project is active
- Ensure connection string uses `postgresql+asyncpg://`

**CORS Error**:
- Verify CORS_ORIGINS includes frontend URL
- Check CORS middleware in src/main.py

**Import Errors**:
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Development Workflow

1. Activate virtual environment
2. Start server: `uvicorn src.main:app --reload`
3. Make changes to code (server auto-reloads)
4. Test endpoints via Swagger UI: http://localhost:8000/docs
5. Run tests: `pytest`
6. Commit changes

## License

Evolution of Todo - Phase II
