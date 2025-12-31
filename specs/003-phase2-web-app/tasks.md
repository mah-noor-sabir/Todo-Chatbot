# Tasks: Phase II - Full-Stack Web Application

**Input**: Design documents from `/specs/003-phase2-web-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test tasks included unless requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend structure: backend/ at repository root
- Frontend structure: frontend/ at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend/ directory structure per plan.md (src/, tests/, migrations/)
- [x] T002 Create frontend/ directory structure per plan.md (src/app/, src/components/, src/lib/)
- [x] T003 [P] Initialize Python project in backend/ with requirements.txt (fastapi, uvicorn, sqlmodel, asyncpg, alembic, python-dotenv, bcrypt, pydantic-settings)
- [x] T004 [P] Initialize Next.js project in frontend/ with TypeScript, React 18+, and Better Auth dependencies
- [x] T005 [P] Create .env.example files for backend/ (DATABASE_URL, SECRET_KEY, CORS_ORIGINS) and frontend/ (NEXT_PUBLIC_API_URL)
- [x] T006 [P] Create .gitignore for backend/ (venv/, __pycache__/, .env, *.pyc) and frontend/ (node_modules/, .next/, .env.local)
- [x] T007 [P] Configure linting tools - backend: black, flake8, mypy; frontend: ESLint, Prettier

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create backend/src/core/config.py with environment variable loading (Pydantic BaseSettings for DATABASE_URL, SECRET_KEY, APP_ENV, DEBUG, CORS_ORIGINS)
- [x] T009 Create backend/src/core/database.py with async SQLAlchemy engine, session factory, and get_session dependency for Neon PostgreSQL (asyncpg driver)
- [x] T010 [P] Create backend/src/core/security.py with bcrypt password hashing functions (hash_password, verify_password)
- [x] T011 [P] Create backend/src/core/exceptions.py with custom exception classes (AuthenticationError, ValidationError, NotFoundError, ForbiddenError)
- [x] T012 Create backend/src/models/base.py with SQLModel base class including created_at and updated_at timestamps
- [x] T013 Initialize Alembic in backend/migrations/ and configure alembic.ini with DATABASE_URL from env
- [x] T014 [P] Create backend/src/main.py with FastAPI app initialization, CORS middleware (allow frontend origin), and app lifespan events
- [x] T015 [P] Create backend/src/api/routes/health.py with GET /health endpoint returning {"status": "ok"}
- [x] T016 [P] Create backend/src/api/middleware/error.py with FastAPI exception handlers for custom exceptions → JSON error responses
- [x] T017 Create frontend/src/lib/api/client.ts with fetch wrapper (base URL, credentials: 'include', JSON serialization, error handling)
- [x] T018 [P] Create frontend/src/lib/types/ directory with user.ts and todo.ts TypeScript type definitions matching backend models
- [x] T019 [P] Create frontend/src/app/layout.tsx with root layout, Better Auth provider, and global styles
- [x] T020 [P] Create frontend/src/components/ui/ directory with reusable components (Button.tsx, Input.tsx, Modal.tsx, ErrorMessage.tsx)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: Authentication & User Management (Priority: P1) 🎯 MVP FOUNDATION

**Goal**: Enable user registration, signin, signout, session persistence, and protected routes

**User Stories**: AUTH-1, AUTH-2, AUTH-3, AUTH-4, AUTH-5, BACKEND-1

**Independent Test**: Register new user → automatically signed in → signout → signin again → session persists across browser restart → attempt to access /todos without auth (redirected) → signin → access granted

### Backend - User Model & Repository

- [x] T021 [P] [US-AUTH] Create backend/src/models/user.py with User SQLModel (id, email unique indexed, password_hash, created_at, updated_at) per data-model.md
- [x] T022 [P] [US-AUTH] Create backend/src/repositories/user_repository.py with UserRepository (create_user, get_user_by_email, get_user_by_id) using async SQLAlchemy sessions
- [x] T023 [US-AUTH] Generate Alembic migration for users table (run: alembic revision --autogenerate -m "Add users table") and apply (alembic upgrade head)

### Backend - Authentication Service

- [x] T024 [US-AUTH] Create backend/src/services/auth_service.py with AuthService (register_user: validate email, hash password, call UserRepository; authenticate_user: verify email exists, verify password, return user; create_session, validate_session using Better Auth SDK)
- [x] T025 [P] [US-AUTH] Create backend/src/services/validation.py with validation functions (validate_email_format, validate_password_strength min 8 chars)

### Backend - Authentication API Routes

- [x] T026 [US-AUTH] Create backend/src/api/routes/auth.py with POST /auth/signup endpoint (validate input, call AuthService.register_user, create Better Auth session, set httpOnly cookie, return UserResponse, handle errors per auth-api.yaml)
- [x] T027 [US-AUTH] Add POST /auth/signin endpoint to backend/src/api/routes/auth.py (validate input, call AuthService.authenticate_user, create session, set cookie, return UserResponse, handle invalid credentials per auth-api.yaml)
- [x] T028 [P] [US-AUTH] Add POST /auth/signout endpoint to backend/src/api/routes/auth.py (invalidate session via Better Auth, clear cookie, return 204 No Content per auth-api.yaml)
- [x] T029 [P] [US-AUTH] Add GET /auth/session endpoint to backend/src/api/routes/auth.py (validate session via Better Auth, return current user or 401 Unauthorized per auth-api.yaml)
- [x] T030 [US-AUTH] Integrate auth routes into backend/src/main.py (include router with prefix /auth)

### Backend - Authentication Middleware

- [x] T031 [US-AUTH] Create backend/src/api/middleware/auth.py with require_auth dependency (validate session cookie via Better Auth, inject current_user into request, raise 401 if invalid)
- [x] T032 [US-AUTH] Create backend/src/api/dependencies.py with get_current_user dependency using auth middleware

### Frontend - Authentication State Management

- [x] T033 [P] [US-AUTH] Configure Better Auth in frontend/src/lib/auth/better-auth.ts (client initialization, session configuration 24-hour expiry, cookie settings httpOnly/secure/sameSite)
- [x] T034 [P] [US-AUTH] Create frontend/src/hooks/useAuth.ts with Better Auth useAuth hook providing {user, isLoading, isAuthenticated, signIn, signOut, signUp}
- [x] T035 [P] [US-AUTH] Create frontend/src/lib/api/auth.ts with API functions (signup(email, password), signin(email, password), signout(), getSession()) calling backend /auth/* endpoints

### Frontend - Signup Page

- [x] T036 [US-AUTH] Create frontend/src/app/signup/page.tsx with signup page route
- [x] T037 [US-AUTH] Create frontend/src/components/auth/SignupForm.tsx with email/password inputs, client-side validation (email format, password >= 8 chars), submit to API signup(), display errors, redirect to /todos on success

### Frontend - Signin Page

- [x] T038 [US-AUTH] Create frontend/src/app/signin/page.tsx with signin page route
- [x] T039 [US-AUTH] Create frontend/src/components/auth/SigninForm.tsx with email/password inputs, client validation, submit to API signin(), display errors, redirect to /todos on success, link to signup page

### Frontend - Protected Routes

- [x] T040 [US-AUTH] Create frontend/src/components/auth/AuthGuard.tsx component (check isAuthenticated from useAuth, redirect to /signin if false, render children if true)
- [x] T041 [US-AUTH] Create frontend/src/app/page.tsx landing page with redirect logic (if authenticated → /todos, else → /signin)

### Frontend - Sign Out

- [x] T042 [US-AUTH] Create frontend/src/components/layout/Header.tsx with app title and "Sign Out" button (calls signOut from useAuth, redirects to /signin)

**Checkpoint**: Authentication complete - users can register, signin, signout, sessions persist, routes protected

---

## Phase 4: Todo Data Model & Repository (Priority: P2)

**Goal**: Enable persistent storage of todos with user ownership

**User Stories**: BACKEND-2

**Independent Test**: Create user → create todo via API → query database directly → verify todo exists with correct user_id → restart application → todo still exists

- [x] T043 [P] [US-TODO-DB] Create backend/src/models/todo.py with Todo SQLModel (id, user_id FK to users, title max 200, description max 1000, is_completed default false, created_at, updated_at) per data-model.md
- [x] T044 [P] [US-TODO-DB] Create backend/src/repositories/todo_repository.py with TodoRepository (create_todo, get_todos_by_user, get_todo_by_id_and_user, update_todo, delete_todo) with async SQLAlchemy, all queries filter by user_id for data isolation
- [x] T045 [US-TODO-DB] Generate Alembic migration for todos table with foreign key ON DELETE CASCADE (alembic revision --autogenerate -m "Add todos table") and apply (alembic upgrade head)
- [ ] T046 [US-TODO-DB] Verify database schema in Neon Console (users and todos tables exist, indexes on users.email and todos(user_id, created_at DESC), foreign key constraint)

**Checkpoint**: Database schema complete, todo persistence ready

---

## Phase 5: Todo CRUD API (Priority: P3)

**Goal**: Implement backend API endpoints for todo create, read, update, delete, toggle completion with user-scoped data access

**User Stories**: BACKEND-3, BACKEND-4

**Independent Test**: Authenticate as user1 → create todo → retrieve todos (only user1's todos) → update todo → toggle completion → delete todo → verify each operation via API responses and database state → authenticate as user2 → attempt to access user1's todo (403 Forbidden)

### Backend - Todo Service

- [x] T047 [US-TODO-API] Create backend/src/services/todo_service.py with TodoService (create_todo: validate title not empty/whitespace, enforce max lengths per spec FR-017/FR-018/FR-019, call repository; get_user_todos: fetch and sort by created_at DESC per spec FR-024; get_todo_by_id: validate ownership per spec FR-012; update_todo: validate ownership and input; toggle_completion: validate ownership; delete_todo: validate ownership)

### Backend - Todo API Routes

- [x] T048 [US-TODO-API] Create backend/src/api/routes/todos.py with POST /todos endpoint (require_auth, validate TodoCreateRequest, call TodoService.create_todo, return 201 Created with TodoResponse per todos-api.yaml)
- [x] T049 [P] [US-TODO-API] Add GET /todos endpoint to backend/src/api/routes/todos.py (require_auth, call TodoService.get_user_todos with current_user.id, return array of TodoResponse per todos-api.yaml)
- [x] T050 [P] [US-TODO-API] Add GET /todos/{id} endpoint to backend/src/api/routes/todos.py (require_auth, call TodoService.get_todo_by_id, return TodoResponse or 404 if not found/wrong user per todos-api.yaml)
- [x] T051 [P] [US-TODO-API] Add PUT /todos/{id} endpoint to backend/src/api/routes/todos.py (require_auth, validate TodoUpdateRequest, call TodoService.update_todo, return 200 OK with TodoResponse or 404/403 per todos-api.yaml)
- [x] T052 [P] [US-TODO-API] Add PATCH /todos/{id} endpoint to backend/src/api/routes/todos.py (require_auth, validate TodoToggleRequest, call TodoService.toggle_completion, return 200 OK with TodoResponse per todos-api.yaml)
- [x] T053 [P] [US-TODO-API] Add DELETE /todos/{id} endpoint to backend/src/api/routes/todos.py (require_auth, call TodoService.delete_todo, return 204 No Content or 404/403 per todos-api.yaml)
- [x] T054 [US-TODO-API] Integrate todo routes into backend/src/main.py (include router with prefix /todos)

**Checkpoint**: Todo API complete - all CRUD operations functional with authentication and ownership validation

---

## Phase 6: Todo List Frontend (Priority: P4)

**Goal**: Display user's todos in responsive list with empty state

**User Stories**: FRONTEND-3

**Independent Test**: Sign in → navigate to /todos → if no todos, see "No todos yet. Create your first one!" → if todos exist, see list sorted newest first → verify responsive layout on mobile (375px) and desktop

- [x] T055 [P] [US-TODO-LIST] Create frontend/src/lib/api/todos.ts with API functions (getTodos(), createTodo(title, description), updateTodo(id, title, description), toggleCompletion(id, is_completed), deleteTodo(id)) calling backend /todos endpoints
- [x] T056 [P] [US-TODO-LIST] Create frontend/src/hooks/useTodos.ts with custom hook managing {todos, loading, error, fetchTodos, createTodo, updateTodo, toggleCompletion, deleteTodo} with optimistic updates for toggle
- [x] T057 [US-TODO-LIST] Create frontend/src/app/todos/page.tsx with todo list page (protected with AuthGuard, uses useTodos hook, renders TodoList component, includes Header with signout)
- [x] T058 [P] [US-TODO-LIST] Create frontend/src/components/todos/TodoList.tsx container (displays loading state, error message, or TodoItem components for each todo, shows empty state if no todos)
- [x] T059 [P] [US-TODO-LIST] Create frontend/src/components/layout/EmptyState.tsx with "No todos yet. Create your first one!" message and icon
- [x] T060 [P] [US-TODO-LIST] Create frontend/src/components/todos/TodoItem.tsx component (displays title, description, completion checkbox, edit button, delete button, strikethrough styling for completed todos, calls toggleCompletion on checkbox click)

**Checkpoint**: Todo list view complete - users can see their todos or empty state

---

## Phase 7: Create Todo Frontend (Priority: P5)

**Goal**: Enable users to create new todos via modal form

**User Stories**: FRONTEND-4

**Independent Test**: Sign in → go to /todos → click "Add Todo" button → modal opens → enter title "Buy groceries" and description "Milk, eggs" → click "Save" → modal closes → new todo appears at top of list → refresh page → todo still visible

- [x] T061 [US-TODO-CREATE] Add "Add Todo" button to frontend/src/app/todos/page.tsx (opens AddTodoForm modal, positioned at top of page)
- [x] T062 [US-TODO-CREATE] Create frontend/src/components/todos/AddTodoForm.tsx modal with title input (required, max 200 chars), description textarea (optional, max 1000 chars), client validation (title not empty), "Save" and "Cancel" buttons, calls useTodos.createTodo on submit, closes modal on success or cancel, displays API errors

**Checkpoint**: Create todo complete - users can add new todos

---

## Phase 8: Edit Todo Frontend (Priority: P6)

**Goal**: Enable users to edit existing todos via modal form

**User Stories**: FRONTEND-5

**Independent Test**: Sign in → view todo list → click "Edit" on a todo → modal opens pre-filled with current title/description → modify title to "Buy groceries and cook" → click "Save" → modal closes → todo updated in list → refresh page → changes persist

- [x] T063 [US-TODO-EDIT] Add "Edit" button to frontend/src/components/todos/TodoItem.tsx (opens EditTodoForm modal, passes current todo data)
- [x] T064 [US-TODO-EDIT] Create frontend/src/components/todos/EditTodoForm.tsx modal pre-filled with todo.title and todo.description, client validation (title not empty/whitespace, max lengths), "Save" and "Cancel" buttons, calls useTodos.updateTodo on submit, closes modal on success, displays API errors (including "This todo has been deleted" for 404)

**Checkpoint**: Edit todo complete - users can modify existing todos

---

## Phase 9: Delete Todo Frontend (Priority: P7)

**Goal**: Enable users to delete todos with confirmation

**User Stories**: FRONTEND-7

**Independent Test**: Sign in → view todo list → click "Delete" on a todo → confirmation dialog appears "Are you sure you want to delete this todo?" → click "Cancel" → todo remains → click "Delete" again → click "Confirm" → todo removed from list → refresh page → todo still deleted

- [x] T065 [US-TODO-DELETE] Add "Delete" button to frontend/src/components/todos/TodoItem.tsx (opens DeleteConfirm dialog, passes todo.id and todo.title)
- [x] T066 [US-TODO-DELETE] Create frontend/src/components/todos/DeleteConfirm.tsx confirmation dialog with message "Are you sure you want to delete this todo?", "Cancel" and "Confirm" buttons, calls useTodos.deleteTodo on confirm, closes dialog on cancel or success, displays API errors

**Checkpoint**: Delete todo complete - users can remove todos safely

---

## Phase 10: Responsive UI & Polish

**Purpose**: Ensure responsive design, improve UX, finalize styling

- [x] T067 [P] Add responsive CSS to frontend/src/styles/globals.css with mobile-first breakpoints (375px+, 768px+, 1024px+) and touch-friendly targets (44px min on mobile)
- [ ] T068 [P] Verify responsive layouts on frontend: signup/signin forms stack on mobile, todo list single column on mobile, modals adapt to screen size
- [ ] T069 [P] Add loading indicators to frontend forms (disable submit button, show spinner) during API calls to prevent double-submission
- [ ] T070 [P] Improve error display on frontend: inline field errors (red text below input), toast notifications for network failures (non-blocking), consistent error styling
- [ ] T071 [P] Add form reset on successful submission (clear inputs after creating todo, close modals)
- [ ] T072 [P] Verify backend error messages match specification examples (e.g., "Title is required", "Invalid email format", "Invalid email or password")
- [ ] T073 [P] Add backend request logging (log API requests: method, path, status code, duration) using structured JSON format
- [ ] T074 [P] Test session expiry: create session → wait 24 hours (or modify expiry for testing) → verify redirect to signin with message "Session expired. Please sign in again."

---

## Phase 11: Integration & End-to-End Validation

**Purpose**: Verify complete user flows work end-to-end

- [ ] T075 Test complete signup flow: navigate to /signup → register with test@example.com → auto-signin → redirected to /todos (empty) → signout → signin again → access granted
- [ ] T076 Test complete todo CRUD flow: signin → create todo "Task 1" → appears in list → toggle complete → visual update → edit to "Task 1 Updated" → changes visible → delete with confirmation → removed from list
- [ ] T077 Test data isolation: signin as user1@example.com → create todo → signout → register user2@example.com → verify cannot see user1's todos → attempt API call to user1's todo ID (403 Forbidden)
- [ ] T078 Test protected routes: signout → attempt to access /todos → redirect to /signin → signin → redirected back to /todos
- [ ] T079 Test session persistence: signin → close browser → reopen → navigate to /todos → still authenticated (no redirect)
- [ ] T080 Test error handling: disconnect from internet → attempt to create todo → see "Unable to connect" error → reconnect → retry successfully
- [ ] T081 Test validation: attempt to create todo with empty title → see "Title is required" → fix and retry → success
- [ ] T082 Verify API documentation: open http://localhost:8000/docs → verify all endpoints (auth, todos, health) listed → test "Try it out" for GET /todos (after auth setup)

---

## Phase 12: Documentation & Deployment Readiness

**Purpose**: Finalize documentation, environment setup, and deployment preparation

- [x] T083 [P] Create backend/README.md with setup instructions (virtual environment, dependencies, env vars, migrations, run server)
- [x] T084 [P] Create frontend/README.md with setup instructions (Node version, npm install, env vars, run dev server)
- [x] T085 [P] Update root README.md with project overview, Phase II features, quickstart links to backend/ and frontend/ READMEs
- [x] T086 [P] Verify .env.example files are complete and match code (all required env vars documented)
- [x] T087 [P] Create deployment guide in specs/003-phase2-web-app/deployment.md (Neon PostgreSQL setup, backend deployment options, frontend deployment to Vercel/Netlify, environment variable configuration)
- [ ] T088 Verify all migrations are applied and database schema matches data-model.md (run: alembic current, compare to plan)
- [ ] T089 Run backend linters: black src/ tests/ (format), flake8 src/ tests/ (lint), mypy src/ (type check) and fix any issues
- [ ] T090 Run frontend linters: npm run lint (ESLint), npm run format (Prettier) and fix any issues
- [ ] T091 Final smoke test: fresh clone → follow quickstart.md → verify application works end-to-end within 15 minutes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **Authentication (Phase 3)**: Depends on Foundational - BLOCKS todo features (auth required for todos)
- **Todo Data Model (Phase 4)**: Depends on Foundational - can run in parallel with Authentication backend work
- **Todo API (Phase 5)**: Depends on Authentication (auth middleware) + Todo Data Model
- **Todo List Frontend (Phase 6)**: Depends on Authentication frontend + Todo API
- **Create Todo (Phase 7)**: Depends on Todo List Frontend + Todo API
- **Edit Todo (Phase 8)**: Depends on Todo List Frontend + Todo API
- **Delete Todo (Phase 9)**: Depends on Todo List Frontend + Todo API
- **Responsive UI (Phase 10)**: Depends on all frontend pages complete
- **Integration Testing (Phase 11)**: Depends on all features complete
- **Documentation (Phase 12)**: Can start after core features, finalize last

### Critical Path (Must Complete Sequentially)

1. Setup → Foundational → Authentication Backend → Authentication Frontend → Todo Data Model → Todo API → Todo List Frontend → Create/Edit/Delete Todos → Integration → Documentation

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T003, T004 (backend init, frontend init)
- T005, T006, T007 (config files, gitignore, linters)

**Within Foundational (Phase 2)**:
- T010, T011 (security utils, exceptions)
- T014, T015, T016 (main.py, health endpoint, error middleware)
- T017, T018, T019, T020 (all frontend foundational work)

**Within Authentication (Phase 3)**:
- T021, T022 (User model, UserRepository)
- T025, T028, T029 (validation utils, signout endpoint, session endpoint)
- T033, T034, T035 (Better Auth config, useAuth hook, API functions)
- T036, T037 (signup page routing, signup form)
- T038, T039 (signin page routing, signin form)

**Within Todo API (Phase 5)**:
- T049, T050, T051, T052, T053 (all todo GET/PUT/PATCH/DELETE endpoints after POST exists)

**Within Frontend Components (Phases 6-9)**:
- T055, T056, T058, T059, T060 (API client, hooks, components) can be developed in parallel

**Within Polish (Phase 10)**:
- T067, T068, T069, T070, T071, T072, T073 (all polish tasks are independent)

**Within Documentation (Phase 12)**:
- T083, T084, T085, T086, T087 (all README files)
- T089, T090 (linters run in parallel)

---

## Implementation Strategy

### MVP First (Core Authentication + Basic Todo List)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: Authentication (signup, signin, signout, protected routes)
4. Complete Phase 4: Todo Data Model (database persistence)
5. Complete Phase 5: Todo API (backend CRUD)
6. Complete Phase 6: Todo List Frontend (view todos)
7. Complete Phase 7: Create Todo Frontend (add new todos)
8. **STOP and VALIDATE**: Test full signup → create todo → view todo flow
9. Deploy/demo if ready

At this point, you have a functional MVP: users can register, signin, create todos, and view their list.

### Incremental Delivery (Add Edit/Delete)

1. Add Phase 8: Edit Todo
2. **STOP and VALIDATE**: Test edit workflow
3. Add Phase 9: Delete Todo
4. **STOP and VALIDATE**: Test delete workflow
5. Deploy/demo updated version

### Final Polish & Production Readiness

1. Complete Phase 10: Responsive UI & Polish
2. Complete Phase 11: Integration Testing (verify all flows)
3. Complete Phase 12: Documentation & Deployment
4. Final deployment to production

### Parallel Team Strategy

With 3-4 developers working in parallel:

**Sprint 1: Foundation**
- Dev 1: Setup + Foundational backend (T001-T016)
- Dev 2: Foundational frontend (T002, T004, T017-T020)
- Dev 3: Database setup, Neon configuration, Alembic init (T013)

**Sprint 2: Authentication**
- Dev 1: Backend auth (models, service, API routes) (T021-T030)
- Dev 2: Frontend auth (pages, forms, hooks) (T033-T042)
- Dev 3: Auth middleware, Better Auth integration (T031-T032, T033)

**Sprint 3: Todo Backend**
- Dev 1: Todo models + repository (T043-T046)
- Dev 2: Todo service + validation (T047)
- Dev 3: Todo API routes (T048-T054)

**Sprint 4: Todo Frontend**
- Dev 1: Todo list view (T055-T060)
- Dev 2: Create todo form (T061-T062)
- Dev 3: Edit todo form (T063-T064)

**Sprint 5: Finalize & Test**
- Dev 1: Delete todo + polish (T065-T074)
- Dev 2: Integration testing (T075-T082)
- Dev 3: Documentation (T083-T091)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story phase should be independently completable and testable
- File paths are absolute from repository root (backend/, frontend/)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 91
**Setup**: 7 tasks
**Foundational**: 13 tasks (blocking)
**Authentication**: 22 tasks (P1 - MVP critical)
**Todo Backend**: 12 tasks (P2-P3)
**Todo Frontend**: 18 tasks (P4-P7)
**Polish**: 8 tasks
**Integration**: 8 tasks
**Documentation**: 7 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel within their phase
**Independent Stories**: Each user story phase can be tested independently once foundational work complete

**MVP Scope** (Minimum Viable Product):
- Phases 1-7: Setup → Foundational → Authentication → Todo Backend → Todo List → Create Todo
- **Tasks**: T001-T062 (62 tasks)
- **Result**: Users can register, signin, create todos, view todos
- **Time Estimate**: 3-4 weeks for single developer, 1-2 weeks for team

**Full Feature Scope**:
- All phases: Setup → ... → Delete Todo → Polish → Testing → Documentation
- **Tasks**: T001-T091 (91 tasks)
- **Result**: Complete Phase II implementation with all features, polish, tests, documentation
- **Time Estimate**: 5-6 weeks for single developer, 2-3 weeks for team
