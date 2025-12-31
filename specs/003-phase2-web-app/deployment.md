# Phase II Deployment Guide

Complete setup and deployment instructions for Evolution of Todo Phase II.

## Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Neon account created (https://neon.tech/)

## Part 1: Neon PostgreSQL Database Setup

### 1.1 Create Neon Project

1. Sign up or log in at https://neon.tech/
2. Click **"Create a project"**
3. Configure project:
   - **Name**: `evolution-of-todo` (or your preference)
   - **Region**: Choose closest to your location
   - **PostgreSQL version**: 15+ (default)
4. Click **"Create project"**

### 1.2 Get Connection String

1. In your Neon project dashboard, navigate to **"Connection Details"**
2. Copy the connection string (format: `postgresql://username:password@host/dbname`)
3. **Important**: Replace `postgresql://` with `postgresql+asyncpg://` for async support

Example transformation:
```
FROM: postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb
TO:   postgresql+asyncpg://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb
```

### 1.3 Verify Database Access

```bash
# Test connection (optional, requires psql)
psql "postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb"
```

## Part 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd Todo-app/backend
```

### 2.2 Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Verify activation (you should see `(venv)` in prompt).

### 2.3 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Expected output: 20+ packages installed (FastAPI, uvicorn, SQLModel, etc.)

### 2.4 Configure Environment Variables

1. Copy template:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

2. Edit `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://your-connection-string-here
SECRET_KEY=generate-this-next
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

3. Generate `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy output and paste into `.env` as `SECRET_KEY` value.

### 2.5 Initialize Database Schema

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial schema with users and todos"

# Apply migration to database
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade -> abc123, Initial schema
```

### 2.6 Verify Backend Setup

```bash
# Start development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
```

**Test endpoints**:
1. Open browser: http://localhost:8000/health
   - Expected: `{"status": "ok"}`
2. Open API docs: http://localhost:8000/docs
   - Expected: Swagger UI with all endpoints

**Keep backend running** and open a new terminal for frontend setup.

## Part 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

```bash
# In new terminal window/tab
cd Todo-app/frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

Expected output: 500+ packages installed.

### 3.3 Configure Environment Variables

1. Copy template:
```bash
# Windows
copy .env.local.example .env.local

# macOS/Linux
cp .env.local.example .env.local
```

2. Verify `.env.local` contents:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

No changes needed if backend runs on port 8000.

### 3.4 Start Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 3.5 Verify Frontend Setup

1. Open browser: http://localhost:3000
   - Expected: Landing page redirects to `/signin`
2. Check browser console (F12) for errors
   - Expected: No errors

## Part 4: End-to-End Testing

### 4.1 User Registration Flow

1. Navigate to: http://localhost:3000/signup
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `testpass123` (min 8 chars)
3. Click **"Sign up"**
4. Expected:
   - Redirect to `/todos` page
   - Header shows "test@example.com"
   - Empty state: "No todos yet. Create your first one!"

### 4.2 Create Todo

1. Click **"Add Todo"** button
2. Fill form:
   - Title: `Buy groceries`
   - Description: `Milk, eggs, bread` (optional)
3. Click **"Create"**
4. Expected:
   - Modal closes
   - New todo appears in list
   - Title displayed prominently

### 4.3 Toggle Completion

1. Click checkbox next to todo
2. Expected:
   - Checkbox becomes checked
   - Title has strikethrough style
   - Instant UI update (optimistic)

### 4.4 Edit Todo

1. Click **"Edit"** button on todo
2. Modify title: `Buy groceries and fruits`
3. Click **"Update"**
4. Expected:
   - Modal closes
   - Updated title displayed

### 4.5 Delete Todo

1. Click **"Delete"** button on todo
2. Confirm deletion in modal
3. Expected:
   - Modal closes
   - Todo removed from list
   - Empty state shown if no todos remain

### 4.6 Sign Out and Sign In

1. Click **"Sign out"** in header
2. Expected: Redirect to `/signin`
3. Sign in with same credentials
4. Expected: Redirect to `/todos` with your data

### 4.7 User Data Isolation

1. Sign out
2. Register new user: `test2@example.com`
3. Expected: Empty todo list (no access to first user's data)

## Part 5: Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Fix**: Ensure virtual environment is activated (`(venv)` in prompt)
- Run: `pip install -r requirements.txt`

**Issue**: `sqlalchemy.exc.OperationalError: could not connect to server`
- **Fix**: Verify `DATABASE_URL` in `.env` is correct
- Check Neon project is active (not paused)
- Ensure `postgresql+asyncpg://` protocol prefix

**Issue**: `alembic.util.exc.CommandError: Can't locate revision`
- **Fix**: Delete `migrations/versions/*.py`, regenerate:
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

**Issue**: Port 8000 already in use
- **Fix**: Find and kill process:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <process-id> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Issue**: `Cannot connect to backend API`
- **Fix**: Verify backend is running at http://localhost:8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Test backend health: http://localhost:8000/health

**Issue**: `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Fix**: Check `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Restart backend server after `.env` changes

**Issue**: Session not persisting after refresh
- **Fix**: Check browser cookies (DevTools → Application → Cookies)
- Verify `session` cookie is set with `httpOnly` flag
- Clear cookies and sign in again

**Issue**: `Module not found` errors
- **Fix**: Delete `.next/` and `node_modules/`, reinstall:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Database Issues

**Issue**: Migration fails with "relation already exists"
- **Fix**: Database has conflicting tables
- **Option 1** (Development only - DATA LOSS):
```sql
-- Connect to Neon SQL editor
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS alembic_version CASCADE;
```
Then regenerate migrations.

**Issue**: Neon project is paused
- **Fix**: Free tier projects auto-pause after inactivity
- Open Neon dashboard, click project to wake it up
- Wait 5-10 seconds, retry connection

## Part 6: Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# With coverage report
pytest --cov=src --cov-report=html

# View coverage
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Part 7: Production Considerations

### Environment Variables

**Backend `.env` for production**:
```env
DATABASE_URL=postgresql+asyncpg://...  # Production Neon database
SECRET_KEY=<strong-random-key-64-chars>
APP_ENV=production
DEBUG=false
CORS_ORIGINS=https://yourdomain.com
```

**Frontend `.env.local` for production**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Security Checklist

- [ ] Change `SECRET_KEY` to production value (64+ chars)
- [ ] Set `DEBUG=false` in production
- [ ] Configure `CORS_ORIGINS` to your domain only
- [ ] Enable HTTPS for all connections
- [ ] Use strong passwords (12+ chars, mixed case, symbols)
- [ ] Set up Neon IP allowlist if needed
- [ ] Review Neon connection pooling settings
- [ ] Enable rate limiting (not included in Phase II)

### Database Backups

Neon provides automatic backups on paid plans. For free tier:

1. Export data periodically:
```bash
pg_dump "postgresql://..." > backup.sql
```

2. Restore if needed:
```bash
psql "postgresql://..." < backup.sql
```

### Monitoring

**Backend**:
- Health check: `GET /health`
- API docs: `/docs` (disable in production if sensitive)

**Database**:
- Neon dashboard: Monitor connections, queries, storage
- Set up alerts for high CPU/memory usage

**Frontend**:
- Browser DevTools Console for client errors
- Network tab for failed API calls

## Part 8: Development Workflow

### Daily Development

```bash
# Terminal 1: Backend
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn src.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Making Changes

**Backend Changes**:
1. Modify code in `backend/src/`
2. Server auto-reloads (watch for errors in terminal)
3. Test via Swagger UI: http://localhost:8000/docs

**Frontend Changes**:
1. Modify code in `frontend/src/`
2. Next.js auto-reloads (hot module replacement)
3. Check browser for visual changes

**Database Schema Changes**:
1. Modify models in `backend/src/models/`
2. Generate migration:
```bash
alembic revision --autogenerate -m "Add new column"
```
3. Review generated migration in `migrations/versions/`
4. Apply migration:
```bash
alembic upgrade head
```

### Code Quality

**Backend**:
```bash
# Format code
black src/ tests/

# Lint
flake8 src/ tests/

# Type check
mypy src/
```

**Frontend**:
```bash
# Lint
npm run lint

# Format
npm run format
```

## Part 9: Getting Help

### Check Logs

**Backend logs**: Terminal running uvicorn shows all requests and errors

**Frontend logs**: Browser DevTools Console (F12)

**Database logs**: Neon dashboard → Monitoring

### Common Commands

```bash
# Backend
pip list                        # List installed packages
alembic current                 # Current migration version
alembic history                 # Migration history
pytest -v                       # Verbose test output

# Frontend
npm list                        # List installed packages
npm run build                   # Production build test
npm run lint -- --fix           # Auto-fix linting issues
```

### Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **SQLModel Docs**: https://sqlmodel.tiangolo.com/
- **Neon Docs**: https://neon.tech/docs/introduction
- **Alembic Docs**: https://alembic.sqlalchemy.org/

### Project Documentation

- Root README: `Todo-app/README.md`
- Backend README: `Todo-app/backend/README.md`
- Frontend README: `Todo-app/frontend/README.md`
- Phase II Spec: `Todo-app/specs/003-phase2-web-app/spec.md`
- Technical Plan: `Todo-app/specs/003-phase2-web-app/plan.md`

## Summary

You now have a complete full-stack todo application with:

✅ User authentication (registration, signin, signout)
✅ Session persistence (24-hour JWT tokens)
✅ Todo CRUD operations (create, read, update, delete)
✅ Toggle completion status
✅ User-scoped data isolation
✅ Responsive UI (mobile and desktop)
✅ RESTful API backend
✅ PostgreSQL database persistence

**Next Steps**: Proceed to Phase III (real-time collaboration) or Phase IV (AI enhancement) as defined in project roadmap.
