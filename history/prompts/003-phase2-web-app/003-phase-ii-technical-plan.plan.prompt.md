---
id: 003
title: Phase II Technical Plan
stage: plan
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5
feature: 003-phase2-web-app
branch: 003-phase2-web-app
user: User
command: /sp.plan
labels: ["phase-ii", "technical-plan", "architecture", "fastapi", "nextjs", "neon-postgresql", "better-auth"]
links:
  spec: specs/003-phase2-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-phase2-web-app/plan.md
  - specs/003-phase2-web-app/research.md
  - specs/003-phase2-web-app/data-model.md
  - specs/003-phase2-web-app/contracts/auth-api.yaml
  - specs/003-phase2-web-app/contracts/todos-api.yaml
  - specs/003-phase2-web-app/quickstart.md
tests:
  - None (planning document)
---

## Prompt

Create the Phase II technical plan for the "Evolution of Todo" project.
The plan must be strictly derived from the Phase II specification and constitution.

BACKEND PLAN:
1. Backend framework responsibility (REST API)
2. API routing and controller structure
3. Authentication integration using Better Auth
4. Data persistence using Neon PostgreSQL
5. User-to-do data ownership handling
6. Error handling and validation approach

FRONTEND PLAN:
1. Next.js application structure
2. Page-level routing (auth pages + todo pages)
3. Component responsibilities
4. API communication strategy
5. Authentication state handling
6. Responsive UI strategy

DATABASE PLAN:
1. User data model
2. Todo data model
3. Relationship between user and todo
4. Migration or schema management approach

## Response snapshot

Successfully created comprehensive Phase II technical plan with complete architecture design, technology research, data modeling, API contracts, and setup guide.

**Plan Structure**:
- Technical Context: Python 3.11+, FastAPI, Neon PostgreSQL, SQLModel, Next.js 14, Better Auth, TypeScript
- Constitution Check: All technologies validated against Phase II authorization matrix - PASS
- Project Structure: Web application (backend/ + frontend/ separation)
- Phase 0 Research: 7 technology decisions documented with rationale and alternatives
- Phase 1 Design: Data models, API contracts, quickstart guide

**Backend Architecture**:
- Framework: FastAPI (async, OpenAPI, Pydantic validation)
- Structure: 3-layer (Domain → Application → Infrastructure)
- Auth: Better Auth (session-based, bcrypt, httpOnly cookies)
- Database: Neon PostgreSQL + SQLModel ORM (unified models)
- Validation: Pydantic at boundaries (client + server)
- Error Handling: Custom exceptions → JSON responses

**Frontend Architecture**:
- Framework: Next.js 14 App Router (SSR, file-based routing, TypeScript)
- Pages: /signup, /signin, /todos (protected)
- Components: Auth (forms, guards), Todos (list, item, forms), UI (reusable), Layout (header, empty state)
- State: useAuth hook (Better Auth), useTodos hook (optimistic updates)
- API Client: Fetch wrapper with credentials

**Database Design**:
- Entities: User (email, password_hash, timestamps), Todo (title, description, is_completed, user_id, timestamps)
- Relationship: User (1) → (0..N) Todo (ON DELETE CASCADE)
- Indexes: users.email (unique), todos.(user_id, created_at DESC) (composite)
- Migrations: Alembic (autogenerate, Neon branch testing)

**API Contracts** (OpenAPI):
- Auth API: POST /auth/signup, /auth/signin, /auth/signout, GET /auth/session
- Todos API: GET /todos, POST /todos, GET/PUT/PATCH/DELETE /todos/{id}
- Response Codes: 200/201/204 (success), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server)
- Error Format: Consistent JSON with code, message, field

**Phase 1 Artifacts Created**:
1. research.md - 7 technology decisions (backend, database, auth, frontend, API, testing, validation)
2. data-model.md - Complete schema (entities, relationships, indexes, migrations, queries)
3. contracts/auth-api.yaml - OpenAPI spec for authentication endpoints
4. contracts/todos-api.yaml - OpenAPI spec for todo CRUD endpoints
5. quickstart.md - Setup guide (prerequisites, 6-step installation, troubleshooting)

**Constitutional Compliance**:
- ✅ All technologies Phase II authorized
- ✅ No Phase III/IV/V technologies used
- ✅ Clean Architecture principles satisfied
- ✅ Stateless services design
- ✅ Separation of concerns enforced
- ✅ Cloud-native readiness (health checks, structured logs, env vars)
- ✅ Testing requirements aligned (unit, integration, contract)

**Specification Compliance**:
- ✅ All 16 user stories mapped to architecture (5 auth + 4 backend + 7 frontend)
- ✅ 61 functional requirements addressed in design
- ✅ 10 API endpoints specified
- ✅ 7 interaction flows covered by component architecture
- ✅ Data models match entity specifications
- ✅ Error cases handled via validation + exception strategy

## Outcome

- ✅ Impact: Complete technical plan with architecture, research, data model, API contracts, setup guide
- 🧪 Tests: Test strategy defined (pytest backend, Jest frontend, unit+integration+contract)
- 📁 Files: Created plan.md, research.md, data-model.md, auth-api.yaml, todos-api.yaml, quickstart.md
- 🔁 Next prompts: Run /sp.tasks to generate implementation tasks based on this plan
- 🧠 Reflection: Plan successfully bridges specification requirements to concrete architecture. Technology choices validated against constitution. All Phase 0-1 artifacts complete. Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation - PASS (constitution check passed, all technologies authorized, architecture sound, complete artifacts)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): During task generation, validate that task breakdown aligns with user story priorities and component architecture
