# Evolution of Todo

A progressive todo application demonstrating Spec-Driven Development (SDD) methodology across multiple phases.

## Current Phase: Phase II - Full-Stack Web Application

Full-stack web application with user authentication, database persistence, and responsive UI.

### Features

- User registration and authentication (email/password)
- Session-based authentication with 24-hour persistence
- Protected routes and data isolation
- Todo CRUD operations (Create, Read, Update, Delete)
- Toggle completion status
- Responsive UI (mobile and desktop)
- RESTful API backend
- Neon PostgreSQL database persistence

## Project Structure

```
Todo-app/
├── backend/              # Python FastAPI REST API
│   ├── src/              # Source code
│   ├── tests/            # Backend tests
│   ├── migrations/       # Database migrations
│   └── README.md         # Backend setup guide
├── frontend/             # Next.js React application
│   ├── src/              # Source code
│   ├── tests/            # Frontend tests
│   └── README.md         # Frontend setup guide
├── specs/                # Spec-Driven Development artifacts
│   └── 003-phase2-web-app/
│       ├── spec.md       # Feature specification
│       ├── plan.md       # Technical plan
│       ├── tasks.md      # Implementation tasks
│       └── contracts/    # API contracts (OpenAPI)
└── .specify/             # SDD framework configuration
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Neon PostgreSQL account

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure .env (copy from .env.example)
# Add your DATABASE_URL and SECRET_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install

# Configure .env.local (copy from .env.local.example)

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

## Usage

1. Navigate to http://localhost:3000
2. Click "Sign up" to create an account
3. Enter email and password (min 8 characters)
4. Automatically signed in and redirected to todo list
5. Click "Add Todo" to create your first task
6. Use checkboxes to mark todos complete
7. Edit or delete todos as needed

## API Documentation

Interactive API docs available when backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

### Backend (Three-Layer Architecture)

- **Domain Layer**: Models (User, Todo) - framework-independent
- **Application Layer**: Services (AuthService, TodoService) - business logic
- **Infrastructure Layer**: API routes, repositories, database

### Frontend (Component-Based)

- **Pages**: App Router file-based routing (/signup, /signin, /todos)
- **Components**: Reusable UI (forms, modals, buttons, inputs)
- **Hooks**: State management (useAuth, useTodos)
- **API Client**: Type-safe API communication

### Database

- **users**: User accounts (email, password_hash, timestamps)
- **todos**: Todo items (title, description, is_completed, user_id FK)
- **Relationships**: User (1) → (0..N) Todo (CASCADE DELETE)

## Testing

### Backend Tests

```bash
cd backend
pytest                          # Run all tests
pytest --cov=src               # With coverage
pytest tests/integration/       # Integration tests only
```

### Frontend Tests

```bash
cd frontend
npm test                  # Run all tests
npm test -- --coverage    # With coverage
```

## Development Phases

- **Phase I**: Console application (completed)
- **Phase II**: Full-stack web app (current)
- **Phase III**: Real-time collaboration (planned)
- **Phase IV**: AI enhancement (planned)
- **Phase V**: Enterprise features (planned)

## Documentation

- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)
- [Phase II Specification](specs/003-phase2-web-app/spec.md)
- [Technical Plan](specs/003-phase2-web-app/plan.md)
- [Implementation Tasks](specs/003-phase2-web-app/tasks.md)
- [Quickstart Guide](specs/003-phase2-web-app/quickstart.md)

## Contributing

This project follows Spec-Driven Development (SDD):
1. Specification → Planning → Tasks → Implementation
2. No code changes without approved tasks
3. All changes must trace back to specifications

See `.specify/memory/constitution.md` for complete development principles.

## License

Evolution of Todo - Educational Project
