---
id: 002
title: Phase I Todo Implementation Plan
stage: plan
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-phase1-todo-console
branch: 001-phase1-todo-console
user: user
command: /sp.plan
labels: ["plan", "phase1", "architecture", "design"]
links:
  spec: specs/001-phase1-todo-console/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-phase1-todo-console/plan.md
  - specs/001-phase1-todo-console/research.md
  - specs/001-phase1-todo-console/data-model.md
  - specs/001-phase1-todo-console/quickstart.md
  - specs/001-phase1-todo-console/contracts/task-service.md
tests:
  - N/A (planning document, tests defined for implementation phase)
---

## Prompt

Create the Phase I technical plan for the Todo in-memory Python console application

The plan must be derived strictly from the Phase I specification and global constitution.
Include:
1. High-level application structure (single Python program)
2. In-memory data structures to store tasks
3. Task identification strategy (ID generation)
4. CLI control flow (menu loop, user input handling)
5. Separation of responsibilities (data handling vs CLI)
6. Error handling strategy for invalid input and missing tasks

Constraints:
- No databases
- No file storage
- No web frameworks
- No external services
- No future phase concepts
The plan must not introduce new features.

It must only describe HOW the approved Phase I requirements will be implemented.

## Response snapshot

Created comprehensive implementation plan with 5 supporting artifacts:

**Architecture**:
- 3-layer structure: Model → Service → CLI
- `src/models/task.py` - Task dataclass
- `src/services/task_manager.py` - Business logic (CRUD)
- `src/cli/menu.py` - User interaction
- `src/main.py` - Entry point and main loop

**Key Decisions** (documented in research.md):
1. Dict[int, Task] for O(1) ID lookup
2. Monotonic counter for ID generation (never reused)
3. Built-in input()/print() for CLI (no external deps)
4. datetime.now() for timestamps
5. ValueError for validation; None for not-found

**Data Model** (data-model.md):
- Task: id, title, description, is_complete, created_at
- Storage: Dict[int, Task] with int counter

**Service Contract** (contracts/task-service.md):
- TaskManager class with 7 methods
- Clear input/output/error specifications

**Constitution Compliance**:
- All 5 principles checked and passed
- Documented waiver for FastAPI/DB (spec explicitly excludes)

## Outcome

- ✅ Impact: Complete technical plan ready for task generation
- 🧪 Tests: Testing strategy defined (unit + integration with pytest)
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, quickstart.md, contracts/task-service.md)
- 🔁 Next prompts: Run /sp.tasks to generate implementation task list
- 🧠 Reflection: Plan maintains strict phase isolation - no DB, files, auth, or web concepts. Clean architecture with testable layers.

## Evaluation notes (flywheel)

- Failure modes observed: None - spec was clear and complete
- Graders run and results (PASS/FAIL): Constitution check - PASS (with documented waiver)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
