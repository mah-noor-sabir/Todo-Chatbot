# Technology Research: Phase II Full-Stack Web Application

**Date**: 2025-12-28
**Feature**: Phase II - Full-Stack Web Application
**Purpose**: Document technology choices, alternatives considered, and rationale for implementation decisions

## Research Summary

This document consolidates research findings for all technology choices in Phase II. Each section addresses a "NEEDS CLARIFICATION" item from the initial Technical Context, providing decision, rationale, alternatives considered, and implementation guidance.

---

## 1. Backend Framework: FastAPI

**Research Question**: Which Python web framework best suits Phase II requirements (REST API, async operations, OpenAPI documentation)?

**Decision**: **FastAPI**

**Rationale**:
1. **Constitution Alignment**: Phase II Backend specifies "Python REST API (FastAPI recommended)" - direct constitutional mandate
2. **Async Support**: Native async/await enables efficient I/O operations with Neon PostgreSQL (critical for database-heavy CRUD operations)
3. **Automatic Documentation**: OpenAPI (Swagger) and ReDoc generated automatically from code annotations - saves manual API documentation effort
4. **Pydantic Integration**: Request/response validation via Pydantic models ensures data integrity at API boundaries - aligns with SQLModel (also Pydantic-based)
5. **Performance**: One of fastest Python frameworks (benchmarks comparable to Node.js/Go) due to Starlette ASGI foundation and async architecture
6. **Developer Experience**: Type hints throughout, excellent IDE autocomplete, clear error messages

**Alternatives Considered**:
- **Flask**:
  - Pros: Mature, large ecosystem, simple
  - Cons: Synchronous by default (requires Flask-Async extensions), no built-in validation, manual OpenAPI generation
  - Rejected: Async support is bolted-on, not native; validation requires additional libraries

- **Django REST Framework (DRF)**:
  - Pros: Batteries-included, mature, admin interface
  - Cons: ORM tight coupling (harder to use SQLModel), heavier framework (ORM, template engine, auth we don't need), slower for simple CRUD
  - Rejected: Over-engineered for Phase II scope; ORM mismatch with SQLModel; performance overhead

- **Sanic**:
  - Pros: Async-first, fast
  - Cons: Smaller community, less mature, no automatic OpenAPI, fewer integrations
  - Rejected: FastAPI has better documentation, larger community, Pydantic integration

**Implementation Guidance**:
- **Dependency Injection**: Use FastAPI's `Depends()` for database sessions, authentication, service layer injection
- **Route Organization**: Separate APIRouter modules for auth (`/auth/*`) and todos (`/todos/*`)
- **Middleware**: Authentication middleware for protected routes, CORS middleware for frontend communication, error handling middleware for consistent JSON responses
- **Validation**: Leverage Pydantic Field validators on request models (e.g., `constr(min_length=8)` for passwords)
- **Testing**: Use TestClient from fastapi.testclient for integration tests

**References**:
- FastAPI Documentation: https://fastapi.tiangolo.com
- Performance Benchmarks: https://www.techempower.com/benchmarks/#section=data-r21&hw=ph&test=query&l=zijzen-7
- FastAPI + SQLModel Tutorial: https://sqlmodel.tiangolo.com/tutorial/fastapi/

---

## 2. Database & ORM: Neon PostgreSQL + SQLModel

**Research Question**: How to implement database persistence with user-scoped data isolation, migrations, and type safety?

**Decision**: **Neon Serverless PostgreSQL** + **SQLModel ORM**

**Rationale**:

### Neon PostgreSQL:
1. **Constitution Mandate**: Phase II Backend - "Neon Serverless PostgreSQL" - constitutional requirement
2. **Serverless Benefits**: Auto-scaling, pay-per-use, zero-downtime scaling, instant database branches for testing
3. **Developer Experience**: Branch-based workflows (create database branch for each feature), time-travel (query historical data), instant provisioning
4. **Free Tier**: Generous limits (10 GB storage, 100 hours compute/month) - sufficient for Phase II development and testing
5. **PostgreSQL Compatibility**: Full PostgreSQL 15+ support, ACID compliance, mature ecosystem

### SQLModel ORM:
1. **Constitution Mandate**: Phase II Backend - "SQLModel or equivalent" - constitutional requirement
2. **Unified Models**: Single model definition serves as database table schema (SQLAlchemy) AND API request/response schema (Pydantic) - eliminates duplication
3. **Type Safety**: Full Python type hints, IDE autocomplete, catch errors at development time not runtime
4. **FastAPI Integration**: Native Pydantic support means SQLModel models work directly as FastAPI request/response models
5. **Async Support**: Async session management via SQLAlchemy 2.0+ async engine

**Alternatives Considered**:

### Database:
- **SQLite**:
  - Pros: Simple, file-based, no server
  - Cons: Not suitable for multi-user web apps, no network access, limited concurrency
  - Rejected: Phase II requires multi-user support with concurrent access

- **Traditional PostgreSQL (self-hosted)**:
  - Pros: Full control, no vendor lock-in
  - Cons: Manual scaling, infrastructure management, no branch-based workflows
  - Rejected: Constitution mandates Neon specifically; Neon provides superior developer experience

### ORM:
- **SQLAlchemy (without SQLModel)**:
  - Pros: Mature, feature-rich, battle-tested
  - Cons: Requires separate Pydantic models for API validation (code duplication), more boilerplate
  - Rejected: SQLModel provides same power with less code via Pydantic integration

- **Tortoise ORM**:
  - Pros: Async-first, Django-like syntax
  - Cons: Smaller community, less mature, no Pydantic integration, limited tooling
  - Rejected: SQLModel has better FastAPI integration and larger community

- **Peewee**:
  - Pros: Lightweight, simple
  - Cons: No async support, no Pydantic integration, less feature-rich
  - Rejected: Missing async support critical for Phase II performance

**Implementation Guidance**:

### Model Definition:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Migration Strategy:
- **Tool**: Alembic (SQLAlchemy-based, SQLModel compatible)
- **Workflow**:
  1. Modify SQLModel models
  2. Generate migration: `alembic revision --autogenerate -m "description"`
  3. Review generated SQL
  4. Test on Neon branch database
  5. Apply to main: `alembic upgrade head`
- **Neon Branching**: Create database branch → test migration → merge if successful

### Connection Management:
- **Async Engine**: `create_async_engine("postgresql+asyncpg://...")`
- **Connection Pooling**: Configure pool size, max overflow, timeout
- **Session Factory**: Use `async_sessionmaker` for database sessions
- **Dependency Injection**: FastAPI Depends() provides session per request

**References**:
- Neon Documentation: https://neon.tech/docs/introduction
- SQLModel Documentation: https://sqlmodel.tiangolo.com
- Alembic Documentation: https://alembic.sqlalchemy.org
- Async SQLAlchemy: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html

---

## 3. Authentication: Better Auth

**Research Question**: How to implement secure user authentication with session management, password hashing, and CSRF protection?

**Decision**: **Better Auth**

**Rationale**:
1. **Constitution Mandate**: Phase II Frontend - "Better Auth (signup/signin)" - constitutional requirement
2. **Framework Agnostic**: Works with any backend (Python, Node.js) and any frontend (React, Next.js, Vue) - flexibility for future changes
3. **Security Best Practices**: Built-in password hashing (bcrypt), CSRF protection, secure session cookies, rate limiting
4. **Session-Based Auth**: Aligns with Phase II requirement (no JWT complexity), session data stored in database (stateless backend)
5. **Extensibility**: Easy to add OAuth, 2FA, magic links in future phases without refactoring
6. **Developer Experience**: Simple API, good documentation, React hooks for frontend

**Alternatives Considered**:

- **NextAuth.js**:
  - Pros: Next.js optimized, popular, many OAuth providers
  - Cons: Next.js specific (frontend lock-in), backend must be Node.js or adapter required, less flexible for Phase III+ evolution
  - Rejected: Backend is Python (not Node.js); Better Auth is framework-agnostic

- **Passport.js**:
  - Pros: Mature, many strategies
  - Cons: Node.js only (backend is Python), requires Express/Koa, no built-in session management
  - Rejected: Backend language mismatch

- **Flask-Login / Django Auth**:
  - Pros: Python-native, mature
  - Cons: Framework-specific, no React integration, manual frontend session handling
  - Rejected: Tight coupling to specific Python framework; poor frontend integration

- **Custom Authentication**:
  - Pros: Full control, no external dependencies
  - Cons: Security risks (easy to get wrong), time-consuming, reinventing wheel, no community support
  - Rejected: High risk, low value; Better Auth provides security expertise out-of-box

**Implementation Guidance**:

### Backend Integration:
- **Session Storage**: PostgreSQL table (Better Auth schema)
- **Endpoints**: `/auth/signup`, `/auth/signin`, `/auth/signout`, `/auth/session`
- **Password Hashing**: bcrypt with configurable work factor (default: 12 rounds)
- **Session Validation**: Middleware checks session cookie, injects current_user into request context

### Frontend Integration:
- **React Hooks**: `useAuth()` provides `{ user, isLoading, isAuthenticated, signIn, signOut }`
- **AuthGuard Component**: Wraps protected routes, redirects to signin if not authenticated
- **API Client**: Automatically includes session cookie (credentials: 'include')

### Session Configuration:
- **Cookie Settings**:
  - `httpOnly: true` (prevents JavaScript access, XSS protection)
  - `secure: true` (HTTPS only in production)
  - `sameSite: 'lax'` (CSRF protection)
  - `maxAge: 86400` (24 hours, per spec requirement)
- **Session Expiry**: 24 hours of inactivity (configurable)
- **Refresh Strategy**: Passive refresh on any authenticated request (extends expiry)

### Security Considerations:
- **Password Requirements**: Min 8 characters (spec requirement), encourage strong passwords (client-side strength meter optional)
- **Rate Limiting**: Limit signin attempts (5 attempts per 15 minutes per IP)
- **HTTPS Only**: Enforce HTTPS in production (secure cookies require it)
- **CSRF Protection**: SameSite cookies + Better Auth CSRF tokens

**References**:
- Better Auth Documentation: https://www.better-auth.com/docs
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Session Management Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

---

## 4. Frontend Framework: Next.js 14+ with App Router

**Research Question**: How to build responsive web UI with server-side rendering, routing, and TypeScript support?

**Decision**: **Next.js 14+ with App Router, TypeScript, React 18+**

**Rationale**:

### Next.js 14:
1. **Constitution Mandate**: Phase II Frontend - "Next.js (React, TypeScript)" - constitutional requirement
2. **App Router**: Modern pattern (file-based routing, layouts, loading states, error boundaries, React Server Components)
3. **SSR/SSG**: Server-side rendering for initial load performance, static site generation where applicable
4. **Built-in Routing**: File-system based, no need for React Router
5. **Image Optimization**: next/image component (automatic lazy loading, responsive images, modern formats)
6. **Developer Experience**: Fast Refresh (hot reload), TypeScript support out-of-box, excellent documentation

### TypeScript:
1. **Constitution Mandate**: "Next.js (React, TypeScript)" - constitutional requirement
2. **Type Safety**: Catch errors at development time, not runtime
3. **IDE Support**: Excellent autocomplete, refactoring, navigation
4. **API Integration**: Type-safe API client functions (request/response types match backend Pydantic models)
5. **Maintainability**: Self-documenting code, easier onboarding, safer refactoring

**Alternatives Considered**:

- **Next.js Pages Router**:
  - Pros: More familiar to some developers, simpler mental model
  - Cons: Older pattern, less efficient, missing App Router features (layouts, loading UI, parallel routes)
  - Rejected: App Router is the future of Next.js; better performance and DX

- **Create React App**:
  - Pros: Simple, minimal configuration
  - Cons: No SSR, no built-in routing, deprecated (officially unmaintained as of 2023), manual setup for everything
  - Rejected: Deprecated, missing critical features (SSR, routing)

- **Vite + React Router**:
  - Pros: Fast build, modern tooling, flexible
  - Cons: No SSR out-of-box (requires manual SSR setup), more configuration, steeper learning curve
  - Rejected: Next.js provides SSR and routing with zero configuration

- **Remix**:
  - Pros: Modern, excellent DX, nested routing, data loading patterns
  - Cons: Less mature than Next.js, smaller ecosystem, steeper learning curve
  - Rejected: Next.js has larger community, more documentation, better Better Auth integration

**Implementation Guidance**:

### Project Structure (App Router):
```
src/app/
├── layout.tsx          # Root layout (Better Auth provider, global styles)
├── page.tsx            # Landing page (redirect logic)
├── signup/
│   └── page.tsx        # Signup page
├── signin/
│   └── page.tsx        # Signin page
└── todos/
    └── page.tsx        # Todo list page (protected)
```

### Component Patterns:
- **Server Components**: Use by default for static content (layouts, headers)
- **Client Components**: Use for interactive elements (forms, buttons, state) - mark with `'use client'`
- **Data Fetching**: Use fetch in Server Components (automatic deduplication, caching)

### Routing:
- **File-based**: Each `page.tsx` becomes a route
- **Dynamic Routes**: `[id]/page.tsx` for todo details (future feature)
- **Route Groups**: `(auth)` for grouping auth pages (signin, signup)
- **Protected Routes**: AuthGuard component wraps protected pages

### Styling:
- **Option 1 - CSS Modules**: Component-scoped styles, zero runtime, standard CSS
- **Option 2 - Tailwind CSS**: Utility-first, rapid development, built-in responsive utilities
- **Recommendation**: Tailwind CSS for Phase II (faster development, responsive utilities built-in)

### TypeScript Configuration:
- **Strict Mode**: Enable `strict: true` in tsconfig.json (catch more errors)
- **Path Aliases**: Configure `@/` alias for cleaner imports (`@/components/auth/SignupForm`)
- **Type Definitions**: Create types matching backend Pydantic models (`User`, `Todo`, API responses)

**References**:
- Next.js 14 Documentation: https://nextjs.org/docs
- App Router Migration Guide: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
- React Server Components: https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components
- TypeScript + Next.js: https://nextjs.org/docs/basic-features/typescript

---

## 5. API Design Pattern: RESTful Architecture

**Research Question**: What API design pattern best supports Phase II CRUD operations with clear contracts and good developer experience?

**Decision**: **RESTful API with JSON, Standard HTTP Methods and Status Codes**

**Rationale**:
1. **Specification Requirement**: FR-022 "System MUST provide RESTful API endpoints for all CRUD operations"
2. **Industry Standard**: Well-understood by all developers, excellent tooling support (Postman, Insomnia, Swagger UI)
3. **OpenAPI Integration**: FastAPI auto-generates OpenAPI specification from route definitions
4. **Simplicity**: Phase II scope is straightforward CRUD - REST is ideal for resource-based operations
5. **HTTP Semantics**: Standard methods (GET, POST, PUT, PATCH, DELETE) and status codes (200, 201, 400, 401, 403, 404, 500) have clear meanings
6. **Caching**: REST supports HTTP caching (GET requests cacheable by default)

**Alternatives Considered**:

- **GraphQL**:
  - Pros: Flexible queries, avoid over-fetching, strong typing, single endpoint
  - Cons: Overkill for simple CRUD, more complex setup, harder caching, steeper learning curve
  - Rejected: Phase II scope doesn't require GraphQL's flexibility; REST is simpler for CRUD

- **gRPC**:
  - Pros: High performance, strong typing (Protocol Buffers), bi-directional streaming
  - Cons: Binary protocol (harder debugging), poor browser support (requires grpc-web), more complex
  - Rejected: REST/JSON is browser-native; Phase II doesn't need gRPC performance or streaming

- **JSON-RPC**:
  - Pros: Simple, RPC-style (function calls), language-agnostic
  - Cons: Less standard than REST, no HTTP semantics (everything is POST), weaker tooling
  - Rejected: REST provides better semantics (methods, status codes) and tooling

**Implementation Guidance**:

### Resource Design:
- **Auth Resources**: `/auth/signup`, `/auth/signin`, `/auth/signout`, `/auth/session`
- **Todo Resources**: `/todos` (collection), `/todos/{id}` (individual)
- **No Nested Resources**: Keep URLs flat (e.g., `/users/{id}/todos` unnecessary since todos are filtered by current_user)

### HTTP Methods:
- **GET**: Read operations (idempotent, cacheable)
  - `GET /todos` - List all user's todos
  - `GET /todos/{id}` - Get single todo
  - `GET /auth/session` - Check session status
- **POST**: Create operations (non-idempotent)
  - `POST /auth/signup` - Create user
  - `POST /auth/signin` - Create session
  - `POST /todos` - Create todo
- **PUT**: Full update (idempotent, replace entire resource)
  - `PUT /todos/{id}` - Update todo title + description
- **PATCH**: Partial update (idempotent, modify specific fields)
  - `PATCH /todos/{id}` - Toggle completion status only
- **DELETE**: Remove resource (idempotent)
  - `DELETE /todos/{id}` - Delete todo
  - `POST /auth/signout` - Delete session (POST used instead of DELETE for cookie handling)

### Status Codes:
- **2xx Success**:
  - `200 OK` - Successful GET, PUT, PATCH
  - `201 Created` - Successful POST (include Location header or created resource in body)
  - `204 No Content` - Successful DELETE (no response body)
- **4xx Client Errors**:
  - `400 Bad Request` - Validation error, malformed JSON
  - `401 Unauthorized` - Missing or invalid authentication
  - `403 Forbidden` - Authenticated but lacks permission
  - `404 Not Found` - Resource doesn't exist
- **5xx Server Errors**:
  - `500 Internal Server Error` - Unexpected error (log details server-side, return generic message)

### Request/Response Format:
- **Content-Type**: `application/json`
- **Request Body**: JSON object matching Pydantic model
- **Response Body**: JSON object or array
- **Error Response**: Consistent format:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Title is required",
      "field": "title"
    }
  }
  ```

### Versioning Strategy:
- **Phase II**: No versioning (single version, breaking changes acceptable pre-production)
- **Future**: URL versioning (`/api/v2/todos`) if breaking changes needed post-production

**References**:
- REST API Tutorial: https://restfulapi.net
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- RESTful API Design Best Practices: https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/
- OpenAPI Specification: https://swagger.io/specification/

---

## 6. Testing Strategy

**Research Question**: What testing approach ensures quality without over-testing for Phase II scope?

**Decision**: **Unit Tests (business logic) + Integration Tests (API endpoints) + Contract Tests (API schemas)**

**Rationale**:
1. **Constitution Requirement**: Section V Quality Principles - "Unit tests for all business logic, Integration tests for API endpoints, Contract tests for external service interactions"
2. **Test Pyramid**: Many unit tests (fast, isolated), fewer integration tests (realistic, slower), minimal E2E tests (deferred to future phases)
3. **Confidence**: Unit tests catch logic errors, integration tests catch routing/database issues, contract tests ensure API matches spec
4. **Speed**: Unit tests run in milliseconds, integration tests in seconds (acceptable for Phase II scope)

**Test Coverage Goals**:
- **Backend**:
  - Unit tests: Services (business logic), repositories (with test database), validation functions
  - Integration tests: All API endpoints (auth, todos, health check)
  - Contract tests: Request/response schemas match OpenAPI spec
- **Frontend**:
  - Unit tests: Utility functions (validation, error handling), hooks (useTodos, useAuth)
  - Component tests: Forms (SignupForm, TodoItem), UI components (Button, Input)
  - Integration tests: Page flows (signup → todos, create todo → appears in list)

**Testing Tools**:

### Backend:
- **pytest**: Python testing framework (fixtures, parametrize, plugins)
- **pytest-asyncio**: Async test support (for FastAPI async routes)
- **httpx**: Async HTTP client for integration tests (TestClient alternative)
- **pytest-cov**: Code coverage reporting (aim for 80%+ coverage)

### Frontend:
- **Jest**: JavaScript testing framework (built into Next.js)
- **React Testing Library**: Component testing (render, user interactions, assertions)
- **MSW (Mock Service Worker)**: API mocking for frontend tests

**Implementation Guidance**:

### Backend Unit Test Example:
```python
# tests/unit/test_todo_service.py
import pytest
from src.services.todo_service import TodoService
from src.models.todo import Todo

@pytest.mark.asyncio
async def test_create_todo_with_valid_data(mock_repo, test_user):
    service = TodoService(mock_repo)
    todo = await service.create_todo(
        user_id=test_user.id,
        title="Test Todo",
        description="Test description"
    )
    assert todo.title == "Test Todo"
    assert todo.user_id == test_user.id
    assert todo.is_completed == False
```

### Backend Integration Test Example:
```python
# tests/integration/test_todos_api.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_todo_authenticated(client: AsyncClient, auth_headers):
    response = await client.post(
        "/todos",
        json={"title": "Test Todo", "description": "Test"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
```

### Frontend Component Test Example:
```typescript
// tests/unit/components/TodoItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '@/components/todos/TodoItem';

test('toggles completion when checkbox clicked', () => {
  const mockToggle = jest.fn();
  const todo = { id: 1, title: 'Test', is_completed: false };

  render(<TodoItem todo={todo} onToggle={mockToggle} />);

  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  expect(mockToggle).toHaveBeenCalledWith(1, true);
});
```

**Testing Workflow**:
1. Write tests before implementation (TDD where practical)
2. Run tests locally before commit
3. CI/CD runs all tests on pull requests
4. Coverage reports highlight untested code
5. Integration tests use test database (separate from development database)

**References**:
- pytest Documentation: https://docs.pytest.org
- FastAPI Testing: https://fastapi.tiangolo.com/tutorial/testing/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Test Pyramid: https://martinfowler.com/articles/practical-test-pyramid.html

---

## 7. Error Handling & Validation

**Research Question**: How to provide clear error messages to users while maintaining security and data integrity?

**Decision**: **Client-side validation (UX) + Server-side validation (security) + Consistent error response format**

**Rationale**:
1. **Defense in Depth**: Client validation for immediate feedback (no network delay), server validation for security (never trust client)
2. **User Experience**: Specification requirement FR-051 "display validation errors clearly", SC-018 "clear, specific error messages"
3. **Security**: Specification requirement FR-015 "prevent whitespace-only titles", FR-018 "max 200 chars" - must enforce server-side
4. **Consistency**: Single error response format across all API endpoints - easier frontend error handling

**Validation Rules** (from spec):
- **Email**: RFC 5322 format, unique in database
- **Password**: Minimum 8 characters
- **Todo Title**: Required, max 200 characters, not whitespace-only
- **Todo Description**: Optional, max 1000 characters

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

**Error Codes**:
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `INTERNAL_ERROR` - Server error (log details, return generic message)

**Implementation Guidance**:

### Backend Validation:
- **Pydantic Field Validators**: Declarative validation on models
  ```python
  class TodoCreate(SQLModel):
      title: str = Field(min_length=1, max_length=200)
      description: str | None = Field(default=None, max_length=1000)

      @validator('title')
      def validate_title_not_whitespace(cls, v):
          if not v.strip():
              raise ValueError('Title cannot be empty')
          return v.strip()
  ```
- **Custom Exceptions**: Domain-specific exceptions (AuthenticationError, ValidationError)
- **FastAPI Exception Handlers**: Convert exceptions to JSON responses
  ```python
  @app.exception_handler(ValidationError)
  async def validation_exception_handler(request, exc):
      return JSONResponse(
          status_code=400,
          content={"error": {"code": "VALIDATION_ERROR", "message": str(exc)}}
      )
  ```

### Frontend Validation:
- **Validation Functions**: Reusable validation logic
  ```typescript
  export function validateEmail(email: string): string | null {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return null;
  }
  ```
- **Form State**: Track errors, display inline with fields
- **Validation Timing**: On blur (immediate feedback) + on submit (final check)

### Error Display:
- **Inline**: Show errors below/above form fields
- **Toast Notifications**: Non-blocking errors (network failures, server errors)
- **Modal Dialogs**: Critical errors requiring acknowledgment
- **Consistent Styling**: Red text, error icon, clear messaging

**User-Friendly Messages** (from spec):
- "Invalid email format" (not "Email regex validation failed")
- "Password must be at least 8 characters" (not "Password length < 8")
- "Title is required" (not "Title field missing")
- "Unable to connect. Please check your connection." (not "Network error: ECONNREFUSED")

**Security Considerations**:
- **Never Expose**: Stack traces, SQL errors, internal paths, system details
- **Generic Server Errors**: "Something went wrong. Please try again." (log details server-side)
- **Rate Limiting**: Prevent brute force attacks on auth endpoints
- **Input Sanitization**: Prevent SQL injection (ORM handles this), XSS (React escapes by default)

**References**:
- Pydantic Validators: https://docs.pydantic.dev/latest/usage/validators/
- FastAPI Error Handling: https://fastapi.tiangolo.com/tutorial/handling-errors/
- OWASP Input Validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- User-Friendly Error Messages: https://uxdesign.cc/how-to-write-error-messages-your-users-will-never-see-a48ed2b00d72

---

## Research Conclusion

All technology choices are **constitutional compliant** and **specification-aligned**. No "NEEDS CLARIFICATION" items remain. Implementation can proceed to Phase 1 (Design & Contracts).

**Key Decisions Summary**:
1. Backend: FastAPI (async, OpenAPI, Pydantic)
2. Database: Neon PostgreSQL + SQLModel (serverless, unified models)
3. Auth: Better Auth (session-based, secure, framework-agnostic)
4. Frontend: Next.js 14 App Router + TypeScript (SSR, file-routing, type-safe)
5. API: RESTful + JSON (simple, standard, well-tooled)
6. Testing: pytest + Jest (unit, integration, contract)
7. Validation: Client + Server (UX + security)

**Next Steps**:
1. Generate data-model.md (database schema)
2. Generate contracts/ (OpenAPI specifications)
3. Generate quickstart.md (setup guide)
4. Run /sp.tasks (implementation tasks)
