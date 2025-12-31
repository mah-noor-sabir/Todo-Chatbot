# Implementation Plan: Phase II - Full-Stack Web Application

**Branch**: `003-phase2-web-app` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-phase2-web-app/spec.md`

## Summary

Phase II transforms the Evolution of Todo project into a full-stack web application with user authentication, database persistence, and multi-user support. The implementation provides RESTful API endpoints for all CRUD operations, persistent storage in Neon Serverless PostgreSQL, user-scoped data isolation, and a responsive Next.js frontend with Better Auth integration.

**Primary Requirement**: Implement all 5 basic todo operations (create, read, update, delete, toggle completion) as a web application with user authentication and database persistence.

**Technical Approach**: Three-tier architecture separating backend API (Python/FastAPI), database (Neon PostgreSQL with SQLModel ORM), and frontend (Next.js with Better Auth). Clean separation enforces data isolation, stateless services enable horizontal scaling, and RESTful API design provides clear contracts between tiers.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript (frontend via Next.js)
**Primary Dependencies**: FastAPI (backend REST API), SQLModel (ORM), Neon PostgreSQL (database), Next.js 14+ (frontend), Better Auth (authentication), React 18+, pydantic (validation), uvicorn (ASGI server)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, fully managed)
**Testing**: pytest with pytest-asyncio (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web browsers (desktop + mobile), backend deployable to any Python-compatible host
**Project Type**: Web application (frontend + backend separation)
**Performance Goals**: <2s page load, <500ms API response (p95), support 50 concurrent users
**Constraints**: <500ms p95 latency, responsive UI (375px+ screens), 24-hour session duration
**Scale/Scope**: Multi-user support (100-1000 users expected), ~100 todos per user maximum initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase II Authorization Matrix Validation

**✅ PASS - Technologies Authorized for Phase II**:

| Technology | Status | Constitutional Authority |
|------------|--------|-------------------------|
| Python REST API (FastAPI) | ✅ Authorized | Phase II: Backend - Framework: Python REST API (FastAPI recommended) |
| Neon Serverless PostgreSQL | ✅ Authorized | Phase II: Backend - Database: Neon Serverless PostgreSQL |
| SQLModel ORM | ✅ Authorized | Phase II: Backend - ORM/Data Layer: SQLModel or equivalent |
| Next.js Frontend | ✅ Authorized | Phase II: Frontend - Framework: Next.js (React, TypeScript) |
| Better Auth | ✅ Authorized | Phase II: Frontend - Authentication: Better Auth (signup/signin) |
| User Authentication | ✅ Authorized | Technology Authorization Matrix: Authentication Phase II ✅ |
| Web Frontend | ✅ Authorized | Technology Authorization Matrix: Web Frontend Phase II ✅ |
| Database Persistence | ✅ Authorized | Technology Authorization Matrix: Database Persistence Phase II ✅ |

**🚫 PROHIBITED - Technologies NOT Authorized for Phase II**:

| Technology | Status | Reason |
|------------|--------|--------|
| Docker/Containerization | ❌ Prohibited | Phase III only - Constitution Section IV |
| Kubernetes | ❌ Prohibited | Phase III only - Constitution Section IV |
| Kafka/Event Streaming | ❌ Prohibited | Phase III only - Constitution Section IV |
| OpenAI Agents SDK | ❌ Prohibited | Phase IV only - Constitution Section IV |
| MCP Servers | ❌ Prohibited | Phase IV only - Constitution Section IV |
| Dapr Runtime | ❌ Prohibited | Phase V only - Constitution Section IV |

### Quality Principles Compliance

**✅ Clean Architecture**:
- Domain layer: User and Todo entities (no framework dependencies)
- Application layer: Use cases for CRUD operations (independently testable)
- Infrastructure layer: FastAPI routes, SQLModel repositories, Better Auth integration
- Dependencies point inward (infrastructure → application → domain)

**✅ Stateless Services**:
- Backend API is stateless (session data in Better Auth, not in-memory)
- Database connection pooled, no in-memory caches
- Horizontally scalable design (cloud-native ready)

**✅ Separation of Concerns**:
- API routes delegate to services (no business logic in routes)
- Services use repositories for data access (no direct SQL in services)
- Configuration externalized via environment variables

**✅ Cloud-Native Readiness**:
- Health check endpoints for backend API
- Graceful shutdown handling
- Structured logging (JSON format)
- Secrets via environment variables (no hardcoded credentials)
- Containerizable (though deployment without containers in Phase II)

**✅ Testing Requirements**:
- Unit tests for all business logic (services, validation)
- Integration tests for API endpoints
- Contract tests for API request/response schemas

### Phase Isolation Compliance

**✅ Phase II Scope Adherence**:
- ✅ User authentication and authorization (signup, signin, signout)
- ✅ User-scoped todo lists (data isolation per user)
- ✅ Database persistence (Neon PostgreSQL)
- ✅ RESTful API backend
- ✅ Web frontend (Next.js)
- ✅ Session management

**❌ Phase III Features EXCLUDED** (correctly deferred):
- ❌ Real-time synchronization (WebSockets)
- ❌ Multi-user collaboration on shared lists
- ❌ Docker containerization
- ❌ Kafka event streaming

**❌ Phase IV Features EXCLUDED** (correctly deferred):
- ❌ AI-powered features
- ❌ OpenAI Agents SDK
- ❌ Intelligent task suggestions

**Gate Result**: ✅ **PASS** - All technology choices authorized, phase isolation maintained, quality principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/003-phase2-web-app/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technology research)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth-api.yaml        # Authentication endpoints (OpenAPI)
│   ├── todos-api.yaml       # Todo CRUD endpoints (OpenAPI)
│   └── schemas.yaml         # Shared data schemas
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── todos.py         # Todo CRUD endpoints
│   │   │   └── health.py        # Health check endpoint
│   │   ├── middleware/
│   │   │   ├── auth.py          # Authentication middleware
│   │   │   └── error.py         # Error handling middleware
│   │   └── dependencies.py      # FastAPI dependencies
│   ├── models/
│   │   ├── user.py              # User domain model (SQLModel)
│   │   ├── todo.py              # Todo domain model (SQLModel)
│   │   └── base.py              # Base model with timestamps
│   ├── services/
│   │   ├── auth_service.py      # Authentication business logic
│   │   ├── todo_service.py      # Todo CRUD business logic
│   │   └── validation.py        # Input validation logic
│   ├── repositories/
│   │   ├── user_repository.py   # User data access
│   │   └── todo_repository.py   # Todo data access
│   ├── core/
│   │   ├── config.py            # Configuration (env vars)
│   │   ├── database.py          # Database connection setup
│   │   ├── security.py          # Password hashing utilities
│   │   └── exceptions.py        # Custom exception classes
│   └── main.py                  # FastAPI application entry point
├── tests/
│   ├── unit/
│   │   ├── test_services.py     # Service layer unit tests
│   │   ├── test_validation.py   # Validation logic tests
│   │   └── test_repositories.py # Repository tests (with test DB)
│   ├── integration/
│   │   ├── test_auth_api.py     # Auth endpoint integration tests
│   │   ├── test_todos_api.py    # Todo endpoint integration tests
│   │   └── conftest.py          # Shared test fixtures
│   └── contract/
│       ├── test_auth_contracts.py   # Auth API contract tests
│       └── test_todos_contracts.py  # Todo API contract tests
├── migrations/
│   └── versions/                # Alembic migration files
├── requirements.txt             # Python dependencies
├── pyproject.toml               # Project metadata (optional)
└── README.md                    # Backend setup instructions

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page (redirect logic)
│   │   ├── signup/
│   │   │   └── page.tsx         # Signup page
│   │   ├── signin/
│   │   │   └── page.tsx         # Signin page
│   │   └── todos/
│   │       └── page.tsx         # Todo list page (protected)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx   # Signup form component
│   │   │   ├── SigninForm.tsx   # Signin form component
│   │   │   └── AuthGuard.tsx    # Protected route wrapper
│   │   ├── todos/
│   │   │   ├── TodoList.tsx     # Todo list container
│   │   │   ├── TodoItem.tsx     # Individual todo display
│   │   │   ├── AddTodoForm.tsx  # Create todo form
│   │   │   ├── EditTodoForm.tsx # Edit todo form
│   │   │   └── DeleteConfirm.tsx # Delete confirmation dialog
│   │   ├── ui/
│   │   │   ├── Button.tsx       # Reusable button component
│   │   │   ├── Input.tsx        # Form input component
│   │   │   ├── Modal.tsx        # Modal dialog component
│   │   │   └── ErrorMessage.tsx # Error display component
│   │   └── layout/
│   │       ├── Header.tsx       # App header with signout
│   │       └── EmptyState.tsx   # Empty state display
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts          # Auth API client functions
│   │   │   ├── todos.ts         # Todo API client functions
│   │   │   └── client.ts        # Base API client (fetch wrapper)
│   │   ├── auth/
│   │   │   ├── better-auth.ts   # Better Auth configuration
│   │   │   └── session.ts       # Session management utilities
│   │   ├── types/
│   │   │   ├── user.ts          # User type definitions
│   │   │   ├── todo.ts          # Todo type definitions
│   │   │   └── api.ts           # API response type definitions
│   │   └── utils/
│   │       ├── validation.ts    # Client-side validation
│   │       └── errors.ts        # Error handling utilities
│   ├── hooks/
│   │   ├── useAuth.ts           # Authentication state hook
│   │   ├── useTodos.ts          # Todo data management hook
│   │   └── useApi.ts            # API call hook with loading/error states
│   └── styles/
│       └── globals.css          # Global styles (responsive)
├── public/
│   └── favicon.ico              # Favicon
├── tests/
│   └── unit/
│       ├── components/          # Component tests
│       └── utils/               # Utility function tests
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
└── README.md                    # Frontend setup instructions

.env.example                     # Environment variables template
.gitignore                       # Git ignore patterns
README.md                        # Project root README
```

**Structure Decision**: **Web application** structure selected (Option 2 from template). Rationale: Phase II implements a full-stack web application requiring clear separation between backend API (Python/FastAPI) and frontend (Next.js). This structure enforces technology boundaries, enables independent deployment, simplifies testing (backend and frontend test suites separate), and aligns with Clean Architecture principles (infrastructure layer separation).

## Complexity Tracking

> **No constitution violations detected. This section intentionally left empty per template instructions.**

---

# Phase 0: Research & Technology Validation

## Research Summary

### Backend Framework: FastAPI

**Decision**: FastAPI for Python REST API

**Rationale**:
- Constitution-mandated: Phase II Backend - "Python REST API (FastAPI recommended)"
- Native async support (critical for I/O-bound operations with Neon PostgreSQL)
- Built-in OpenAPI documentation (auto-generated from code)
- Pydantic integration for request/response validation
- High performance (comparable to Node.js/Go due to async architecture)
- Excellent SQLModel integration (both use Pydantic models)

**Alternatives Considered**:
- Flask: Synchronous by default, requires extensions for async, less modern
- Django REST Framework: Heavier framework, ORM tight coupling, slower for simple CRUD
- FastAPI chosen for: async-first design, automatic API docs, validation, performance

**Implementation Approach**:
- Use FastAPI dependency injection for database sessions, auth validation
- Leverage automatic OpenAPI schema generation for API documentation
- Use Pydantic models for request/response validation (aligns with SQLModel)
- Structure routes as APIRouter modules (auth, todos, health)

### Database: Neon Serverless PostgreSQL with SQLModel ORM

**Decision**: Neon PostgreSQL + SQLModel ORM

**Rationale**:
- Constitution-mandated: Phase II Backend - "Neon Serverless PostgreSQL" and "SQLModel or equivalent"
- Neon benefits: Serverless (auto-scaling), generous free tier, branch-based development
- SQLModel benefits: Combines Pydantic (validation) + SQLAlchemy (ORM), type-safe, FastAPI-native
- Single model definition serves as: database table, API schema, validation schema

**Alternatives Considered**:
- SQLAlchemy alone: Requires separate Pydantic models for API, code duplication
- Tortoise ORM: Less mature, smaller community, no Pydantic integration
- SQLModel chosen for: unified models, type safety, FastAPI integration, active development

**Implementation Approach**:
- Define models with SQLModel (inherits from SQLModel base, Pydantic for validation)
- Use Alembic for database migrations (SQLModel compatible)
- Connection pooling via SQLAlchemy engine
- Async database access (asyncpg driver for PostgreSQL)

### Authentication: Better Auth

**Decision**: Better Auth for user authentication

**Rationale**:
- Constitution-mandated: Phase II Frontend - "Better Auth (signup/signin)"
- Framework-agnostic (works with any backend/frontend)
- Session-based authentication (no JWT complexity in Phase II)
- Built-in security best practices (password hashing, CSRF protection)
- Extensible for future features (OAuth, 2FA in later phases)

**Alternatives Considered**:
- NextAuth.js: Next.js specific, limited backend flexibility
- Passport.js: Node.js only (backend is Python)
- Custom auth: Reinventing wheel, security risks, time-consuming
- Better Auth chosen for: framework agnostic, security, simplicity, future extensibility

**Implementation Approach**:
- Backend: Better Auth SDK for Python (session validation, password hashing)
- Frontend: Better Auth React hooks (useAuth, useSession)
- Session storage: PostgreSQL (sessions table)
- Cookie-based sessions (httpOnly, secure, sameSite)

### Frontend: Next.js 14 with App Router

**Decision**: Next.js 14+ with App Router, TypeScript, React 18+

**Rationale**:
- Constitution-mandated: Phase II Frontend - "Next.js (React, TypeScript)"
- App Router benefits: Server components, improved routing, layouts, loading states
- TypeScript: Type safety, better IDE support, catch errors early
- React 18: Concurrent rendering, suspense, improved hydration

**Alternatives Considered**:
- Next.js Pages Router: Older pattern, less efficient, App Router is future
- Create React App: No SSR, no routing built-in, deprecated
- Vite + React Router: More manual setup, no SSR out of box
- Next.js App Router chosen for: modern patterns, SSR/SSG capabilities, routing, TypeScript support

**Implementation Approach**:
- App Router with file-system routing (app/signup, app/signin, app/todos)
- Server components for static layouts, client components for interactive forms
- Better Auth React hooks for authentication state
- Fetch API for backend communication (native, no axios dependency)
- CSS Modules or Tailwind CSS for responsive styling

### API Design: RESTful Patterns

**Decision**: RESTful API with JSON, standard HTTP methods and status codes

**Rationale**:
- Specification requirement: FR-022 "RESTful API endpoints for all CRUD operations"
- Industry standard, well-understood, excellent tooling support
- Aligns with OpenAPI specification (auto-generated docs)
- Simple for Phase II scope (complex needs like GraphQL deferred)

**API Patterns**:
- Resource-based URLs: `/auth/signup`, `/todos`, `/todos/{id}`
- Standard HTTP methods: GET (read), POST (create), PUT (update), PATCH (partial update), DELETE (delete)
- Standard status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
- JSON request/response bodies
- Authentication via session cookies (Better Auth)

**Implementation Approach**:
- FastAPI route handlers return Pydantic models (auto-serialized to JSON)
- Use FastAPI HTTPException for error responses
- Middleware for authentication validation (inject current_user dependency)
- OpenAPI schema auto-generated from Pydantic models and route signatures

### Error Handling Strategy

**Decision**: Consistent error response format, validation at boundaries, user-friendly messages

**Rationale**:
- Specification requirement: FR-026 "meaningful error messages in API responses", FR-051 "display validation errors clearly"
- User experience: Clear, actionable error messages prevent frustration
- Security: Don't expose internal implementation details in errors

**Error Response Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "field": "title",
    "details": {}
  }
}
```

**Implementation Approach**:
- Client-side validation (immediate feedback, no network round-trip)
- Server-side validation (trust boundary, security)
- Custom exception classes for domain errors (AuthenticationError, ValidationError, NotFoundError)
- FastAPI exception handlers for consistent JSON responses
- User-friendly messages in spec (never expose SQL errors, stack traces)

### Validation Strategy

**Decision**: Pydantic validation on backend, React state validation on frontend

**Rationale**:
- Defense in depth: Client validation for UX, server validation for security
- Pydantic: Declarative validation, type coercion, clear error messages
- Specification requirements: FR-017 "validate title not empty", FR-018 "title max 200", FR-019 "description max 1000"

**Validation Rules** (from spec):
- Email: RFC 5322 format
- Password: Minimum 8 characters
- Todo title: Required, max 200 characters, no whitespace-only
- Todo description: Optional, max 1000 characters

**Implementation Approach**:
- Backend: Pydantic Field validators on SQLModel models
- Frontend: React state + validation functions (validate on blur, before submit)
- Consistent error messages between client and server
- Display errors inline with form fields

---

# Phase 1: Design & Contracts

## Data Model

See [data-model.md](./data-model.md) for complete database schema, entity definitions, relationships, indexes, and constraints.

**Summary**:
- **User table**: id (PK), email (unique), password_hash, created_at, updated_at
- **Todo table**: id (PK), user_id (FK), title, description, is_completed, created_at, updated_at
- **Relationship**: User (1) → (0..N) Todo
- **Indexes**: user.email (unique), todo.user_id + created_at (query optimization)
- **Constraints**: ON DELETE CASCADE (delete user deletes their todos)

## API Contracts

See [contracts/](./contracts/) directory for complete OpenAPI specifications.

**Summary**:
- **Auth API**: `/auth/signup` (POST), `/auth/signin` (POST), `/auth/signout` (POST), `/auth/session` (GET)
- **Todo API**: `/todos` (POST, GET), `/todos/{id}` (GET, PUT, PATCH, DELETE)
- **Authentication**: Session cookie (httpOnly, secure, sameSite=lax)
- **Request/Response**: JSON content-type
- **Status Codes**: 200/201/204 (success), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)

## Quickstart Guide

See [quickstart.md](./quickstart.md) for complete setup instructions, environment configuration, and development workflow.

**Summary**:
1. Clone repository
2. Backend setup: Install Python 3.11+, create virtual environment, install dependencies, configure Neon database connection
3. Frontend setup: Install Node.js 18+, install dependencies, configure API URL
4. Run migrations: `alembic upgrade head`
5. Start backend: `uvicorn src.main:app --reload`
6. Start frontend: `npm run dev`
7. Access: http://localhost:3000

## Backend Architecture

### Layer Structure

**Domain Layer** (models/):
- `User` model: Email, password hash, timestamps
- `Todo` model: Title, description, completion status, user association, timestamps
- Pure data models, no framework dependencies, validation via Pydantic

**Application Layer** (services/):
- `AuthService`: register_user, authenticate_user, validate_session
- `TodoService`: create_todo, get_user_todos, get_todo_by_id, update_todo, toggle_completion, delete_todo
- Business logic, orchestrates repositories, enforces rules (ownership validation)

**Infrastructure Layer** (api/, repositories/, core/):
- `api/routes/`: FastAPI route handlers (thin controllers, delegate to services)
- `repositories/`: Data access layer (UserRepository, TodoRepository)
- `core/database.py`: Database connection, session management
- `core/security.py`: Password hashing (bcrypt), token generation
- `core/config.py`: Environment variable loading (pydantic BaseSettings)

### Dependency Flow

```
API Routes → Services → Repositories → Database
     ↓          ↓
Middleware   Domain Models
```

- API routes depend on services (injected via FastAPI dependencies)
- Services depend on repositories (injected)
- Repositories depend on database session (injected)
- Middleware provides authentication context (current_user)

### Authentication Flow

1. **Signup**: POST /auth/signup → AuthService.register_user → hash password → UserRepository.create → Better Auth session → set cookie → 201 Created
2. **Signin**: POST /auth/signin → AuthService.authenticate_user → verify password → Better Auth session → set cookie → 200 OK
3. **Protected Request**: Request with session cookie → Middleware validates → Better Auth verifies → inject current_user → proceed to route handler
4. **Signout**: POST /auth/signout → Better Auth invalidate session → clear cookie → 204 No Content

### Data Ownership Validation

- Every todo operation requires authentication (middleware enforces)
- Services validate todo.user_id == current_user.id before update/delete
- Repository queries filter by user_id (implicit in service layer)
- Attempting to access another user's todo returns 403 Forbidden

### Error Handling

- Custom exception classes: `AuthenticationError`, `ValidationError`, `NotFoundError`, `ForbiddenError`
- FastAPI exception handlers convert to JSON responses
- Validation errors from Pydantic automatically formatted
- Database errors caught, logged, return generic 500 (don't expose internals)

### API Response Patterns

**Success Responses**:
- 200 OK: GET requests, successful operations returning data
- 201 Created: POST requests (signup, create todo), include created resource
- 204 No Content: DELETE requests, signout (no response body)

**Error Responses**:
- 400 Bad Request: Validation errors, malformed JSON
- 401 Unauthorized: Missing or invalid session
- 403 Forbidden: Valid session but lacks permission (wrong user)
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Unexpected errors (logged server-side)

## Frontend Architecture

### Page Structure (App Router)

- **app/layout.tsx**: Root layout, Better Auth provider, global styles
- **app/page.tsx**: Landing page, redirect logic (authenticated → /todos, else → /signin)
- **app/signup/page.tsx**: Signup form page (public)
- **app/signin/page.tsx**: Signin form page (public)
- **app/todos/page.tsx**: Todo list page (protected, AuthGuard wrapper)

### Component Organization

**Auth Components** (components/auth/):
- `SignupForm`: Email/password inputs, client validation, submit to POST /auth/signup
- `SigninForm`: Email/password inputs, client validation, submit to POST /auth/signin
- `AuthGuard`: Wrapper component, checks session, redirects if unauthenticated

**Todo Components** (components/todos/):
- `TodoList`: Fetches todos, displays list, handles empty state
- `TodoItem`: Displays single todo, completion checkbox, edit/delete buttons
- `AddTodoForm`: Modal with title/description inputs, submit to POST /todos
- `EditTodoForm`: Modal pre-filled with todo data, submit to PUT /todos/{id}
- `DeleteConfirm`: Confirmation dialog, submit to DELETE /todos/{id}

**UI Components** (components/ui/):
- `Button`: Reusable button (variants: primary, secondary, danger)
- `Input`: Form input with label, error message display
- `Modal`: Dialog overlay for forms
- `ErrorMessage`: Styled error display component

**Layout Components** (components/layout/):
- `Header`: App title, signout button (authenticated users only)
- `EmptyState`: "No todos yet. Create your first one!" message with icon

### State Management

**Authentication State**:
- Better Auth `useAuth()` hook provides: `user`, `isLoading`, `isAuthenticated`
- Session stored in httpOnly cookie (not accessible to JavaScript)
- AuthGuard checks `isAuthenticated`, redirects to /signin if false

**Todo State**:
- Custom `useTodos()` hook manages: `todos`, `loading`, `error`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleCompletion`
- Optimistic updates for toggle completion (immediate UI feedback, revert on error)
- Refetch todos after create/update/delete (ensures consistency)

**Form State**:
- React useState for form inputs (controlled components)
- Validation on blur + before submit
- Error state for displaying validation messages
- Loading state for submit button (prevents double-submit)

### API Communication

**API Client** (lib/api/client.ts):
- Fetch wrapper with base URL configuration
- Automatic JSON serialization/deserialization
- Session cookie automatically included (credentials: 'include')
- Error handling (throw on non-2xx responses)

**Auth API** (lib/api/auth.ts):
- `signup(email, password)`: POST /auth/signup
- `signin(email, password)`: POST /auth/signin
- `signout()`: POST /auth/signout
- `getSession()`: GET /auth/session

**Todo API** (lib/api/todos.ts):
- `getTodos()`: GET /todos
- `createTodo(title, description)`: POST /todos
- `updateTodo(id, title, description)`: PUT /todos/{id}
- `toggleCompletion(id, is_completed)`: PATCH /todos/{id}
- `deleteTodo(id)`: DELETE /todos/{id}

### Responsive UI Strategy

**Breakpoints**:
- Mobile: 375px - 767px (single column, vertical stack)
- Tablet: 768px - 1023px (adaptive layout)
- Desktop: 1024px+ (multi-column, optimized for mouse)

**Responsive Patterns**:
- Mobile-first CSS (base styles for mobile, media queries for larger screens)
- Flexbox for layouts (wrap on small screens)
- Touch-friendly targets (44px minimum on mobile)
- Modal forms (consistent across screen sizes)

**Implementation**:
- CSS Modules for component-scoped styles
- Media queries for breakpoints
- Use Next.js Image component for responsive images
- Viewport meta tag for mobile scaling

### Authentication State Handling

**Initial Load**:
1. App loads → Better Auth checks session cookie
2. If valid session → fetch user data → set authenticated state
3. If invalid/missing → set unauthenticated state
4. AuthGuard redirects based on route + auth state

**Session Persistence**:
- Session cookie persists across browser restarts (24-hour expiry)
- On page refresh, Better Auth revalidates session
- If session expired → redirect to signin with message

**Signout Flow**:
1. User clicks signout → POST /auth/signout
2. Backend invalidates session
3. Frontend clears auth state
4. Redirect to /signin

## Database Design

### Schema Overview

**users table**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**todos table**:
```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);
```

### Relationships

- User (1) → (0..N) Todo (one-to-many)
- Foreign key: todos.user_id → users.id
- Cascade delete: Deleting user deletes all their todos

### Migration Strategy

- **Tool**: Alembic (SQLAlchemy migration tool, SQLModel compatible)
- **Process**: Generate migrations from SQLModel changes, review, apply to database
- **Commands**:
  - Generate: `alembic revision --autogenerate -m "message"`
  - Apply: `alembic upgrade head`
  - Rollback: `alembic downgrade -1`
- **Branching**: Neon supports database branches for testing migrations safely

### Indexes

- **users.email**: Unique index (enforce uniqueness, fast signin lookup)
- **todos.user_id + created_at**: Composite index (optimize "get user's todos ordered by created_at")

### Constraints

- **NOT NULL**: email, password_hash, title, user_id, is_completed, timestamps
- **UNIQUE**: users.email
- **FOREIGN KEY**: todos.user_id → users.id
- **CHECK**: title length ≤ 200, description length ≤ 1000 (enforced by Pydantic, database as backup)
- **DEFAULT**: is_completed = false, timestamps = CURRENT_TIMESTAMP

---

# Phase 2: Task Generation

**Note**: Task generation is performed by the `/sp.tasks` command, NOT by `/sp.plan`. This plan document provides the architectural foundation for task generation.

**Next Step**: Run `/sp.tasks` to generate `tasks.md` with concrete implementation tasks based on this plan.

---

# Appendix: Technology Decisions Summary

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| Backend Language | Python 3.11+ | Constitution-mandated, async support, mature ecosystem |
| Backend Framework | FastAPI | Constitution-recommended, async, OpenAPI, Pydantic integration |
| Database | Neon PostgreSQL | Constitution-mandated, serverless, free tier, branch-based dev |
| ORM | SQLModel | Constitution-mandated, Pydantic + SQLAlchemy, type-safe, FastAPI-native |
| Authentication | Better Auth | Constitution-mandated, framework-agnostic, session-based, secure |
| Frontend Framework | Next.js 14 | Constitution-mandated, App Router, SSR, TypeScript, modern patterns |
| Frontend Language | TypeScript | Type safety, IDE support, catch errors early |
| API Design | RESTful + JSON | Specification requirement, industry standard, simple for Phase II scope |
| Migration Tool | Alembic | SQLModel/SQLAlchemy compatible, mature, battle-tested |
| Backend Testing | pytest + pytest-asyncio | Python standard, async support, extensive plugins |
| Frontend Testing | Jest + React Testing Library | Industry standard, component testing, good Next.js support |
| Styling | CSS Modules or Tailwind | Scoped styles, responsive, minimal bundle size |
| Validation | Pydantic (backend) + React state (frontend) | Defense in depth, type-safe, clear error messages |
| Error Handling | Custom exceptions + FastAPI handlers | Consistent JSON responses, user-friendly messages |
| Session Storage | PostgreSQL (via Better Auth) | Persistent, secure, scales with database |
| Password Hashing | bcrypt (via Better Auth) | Industry standard, secure, slow by design (brute-force resistant) |

---

**Plan Status**: ✅ Complete - Ready for Phase 1 artifact generation (research.md, data-model.md, contracts/, quickstart.md)

**Next Steps**:
1. Generate `research.md` with detailed technology research
2. Generate `data-model.md` with complete database schema
3. Generate `contracts/` directory with OpenAPI specifications
4. Generate `quickstart.md` with setup instructions
5. Run `/sp.tasks` to generate implementation tasks
