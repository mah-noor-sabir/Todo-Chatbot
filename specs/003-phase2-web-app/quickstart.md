# Quickstart Guide: Phase II Full-Stack Web Application

**Last Updated**: 2025-12-28
**Target Audience**: Developers setting up local development environment

## Overview

This guide provides step-by-step instructions to set up and run the Phase II full-stack todo application locally. The application consists of:
- **Backend**: Python FastAPI REST API
- **Database**: Neon Serverless PostgreSQL
- **Frontend**: Next.js (React + TypeScript)
- **Authentication**: Better Auth (session-based)

**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

### Required Software

1. **Python 3.11+**
   - Check: `python --version` or `python3 --version`
   - Install: https://www.python.org/downloads/

2. **Node.js 18+** and **npm**
   - Check: `node --version` and `npm --version`
   - Install: https://nodejs.org/

3. **Git**
   - Check: `git --version`
   - Install: https://git-scm.com/

4. **PostgreSQL Client (optional, for manual database inspection)**
   - Check: `psql --version`
   - Install: https://www.postgresql.org/download/

### Required Accounts

1. **Neon Account** (for database)
   - Sign up: https://neon.tech/
   - Free tier: 10 GB storage, 100 compute hours/month

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd Todo-app
git checkout 003-phase2-web-app
```

---

## Step 2: Database Setup (Neon PostgreSQL)

### 2.1 Create Neon Project

1. Log in to Neon Console: https://console.neon.tech/
2. Click "New Project"
3. Settings:
   - **Project Name**: evolution-of-todo
   - **PostgreSQL Version**: 15 (default)
   - **Region**: Choose closest to your location
4. Click "Create Project"

### 2.2 Get Connection String

1. In Neon Console, go to project dashboard
2. Find **Connection String** section
3. Copy connection string (format: `postgresql://user:password@host/dbname`)
4. Save for Step 3

### 2.3 Create Database Branch (Optional, for safe testing)

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create dev branch
neonctl branches create --name dev-local

# Get branch connection string
neonctl connection-string dev-local
```

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: If `requirements.txt` doesn't exist yet, install manually:
```bash
pip install fastapi uvicorn sqlmodel asyncpg alembic python-dotenv bcrypt pydantic-settings pytest pytest-asyncio httpx
```

### 3.4 Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
# ^ Replace with your Neon connection string from Step 2.2
# Important: Use asyncpg driver (replace postgresql:// with postgresql+asyncpg://)

# Better Auth
SECRET_KEY=your-secret-key-change-this-in-production
# ^ Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"

# Application
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

### 3.5 Run Database Migrations

```bash
# Initialize Alembic (if not already initialized)
alembic init migrations

# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 3.6 Start Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend**:
- Open browser: http://localhost:8000/docs
- Should see FastAPI Swagger UI with API endpoints

---

## Step 4: Frontend Setup

### 4.1 Navigate to Frontend Directory (new terminal)

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth (frontend config will be in code)
```

### 4.4 Start Frontend Dev Server

```bash
npm run dev
```

**Expected Output**:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.5s
```

**Verify Frontend**:
- Open browser: http://localhost:3000
- Should see landing page with redirect to signin

---

## Step 5: Verify Application

### 5.1 Test User Registration

1. Navigate to: http://localhost:3000/signup
2. Enter:
   - Email: test@example.com
   - Password: testpassword123
3. Click "Sign Up"
4. Should redirect to /todos (empty todo list)

### 5.2 Test Todo Creation

1. On /todos page, click "Add Todo"
2. Enter:
   - Title: "Test Todo"
   - Description: "This is a test"
3. Click "Save"
4. Todo should appear in list

### 5.3 Test Todo Operations

- **Toggle Completion**: Click checkbox → todo marked complete
- **Edit**: Click "Edit" → modify title/description → "Save"
- **Delete**: Click "Delete" → confirm → todo removed

### 5.4 Test Sign Out

1. Click "Sign Out" button
2. Should redirect to /signin
3. Try accessing /todos directly → should redirect to /signin (protected route)

---

## Step 6: Run Tests (Optional)

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/integration/test_auth_api.py
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TodoItem.test.tsx
```

---

## Common Issues & Solutions

### Issue: Database Connection Error

**Error**: `asyncpg.exceptions.InvalidPasswordError`

**Solution**:
- Verify DATABASE_URL in backend/.env
- Ensure connection string uses `postgresql+asyncpg://` prefix
- Check Neon project is active (not suspended)
- Verify password doesn't contain special characters that need URL encoding

### Issue: CORS Error in Frontend

**Error**: `Access to fetch at 'http://localhost:8000/auth/signup' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
- Add CORS middleware to backend `src/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Session Cookie Not Set

**Error**: User registered but not automatically signed in

**Solution**:
- Verify Better Auth configuration includes:
  - `credentials: 'include'` in frontend fetch calls
  - `Set-Cookie` header includes `SameSite=Lax` and `HttpOnly=True`
- Check browser dev tools → Application → Cookies → verify session cookie exists

### Issue: Alembic Migration Fails

**Error**: `alembic.util.exc.CommandError: Can't locate revision identified by 'xxxx'`

**Solution**:
- Delete migrations/versions/*.py files
- Regenerate: `alembic revision --autogenerate -m "Initial schema"`
- Apply: `alembic upgrade head`

### Issue: Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution Backend** (port 8000):
```bash
# Find process using port 8000
lsof -ti:8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Solution Frontend** (port 3000):
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

---

## Development Workflow

### Daily Startup

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Making Changes

**Backend Changes**:
1. Modify code in `backend/src/`
2. Server auto-reloads (watch for errors in terminal)
3. Test API: http://localhost:8000/docs

**Frontend Changes**:
1. Modify code in `frontend/src/`
2. Next.js auto-reloads (watch for errors in terminal)
3. Test UI: http://localhost:3000

**Database Schema Changes**:
1. Modify SQLModel models in `backend/src/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review migration file in `backend/migrations/versions/`
4. Apply: `alembic upgrade head`
5. Test with dummy data

### Running Linters

**Backend**:
```bash
cd backend
# Format code
black src/ tests/

# Lint
flake8 src/ tests/

# Type check
mypy src/
```

**Frontend**:
```bash
cd frontend
# Lint
npm run lint

# Format
npm run format
```

---

## API Documentation

Once backend is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide:
- All endpoints (Auth, Todos)
- Request/response schemas
- Try-it-out functionality (test API directly from browser)

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DATABASE_URL | Neon PostgreSQL connection string | postgresql+asyncpg://user:pass@host/db | Yes |
| SECRET_KEY | Better Auth secret key | random-string-32+ | Yes |
| APP_ENV | Environment (development/production) | development | No |
| DEBUG | Enable debug mode | true | No |
| CORS_ORIGINS | Allowed CORS origins (comma-separated) | http://localhost:3000 | Yes |

### Frontend (.env.local)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_URL | Backend API base URL | http://localhost:8000 | Yes |

---

## Next Steps

1. **Read Specification**: [spec.md](./spec.md) - Understand requirements
2. **Review Architecture**: [plan.md](./plan.md) - Study technical decisions
3. **Explore Data Model**: [data-model.md](./data-model.md) - Database schema
4. **API Contracts**: [contracts/](./contracts/) - OpenAPI specifications
5. **Implement Tasks**: Run `/sp.tasks` to generate implementation tasks

---

## Getting Help

- **API Issues**: Check Swagger UI (http://localhost:8000/docs) for endpoint details
- **Database Issues**: Inspect Neon Console (https://console.neon.tech/)
- **Frontend Issues**: Check browser dev tools console for errors
- **Testing**: Run `pytest` (backend) or `npm test` (frontend) to verify functionality

---

**Setup Complete!** You now have a fully functional local development environment for Phase II.
