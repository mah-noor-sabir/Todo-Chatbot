# Tasks: Phase I Todo Console Application

**Input**: Design documents from `/specs/001-phase1-todo-console/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/task-service.md
**Branch**: `001-phase1-todo-console`
**Date**: 2025-12-27

**Tests**: Unit tests included as per constitution requirement (V. Testing Requirements).

**Organization**: Tasks organized by implementation phase, then by user story (P1-P5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5, or CORE for shared)
- Exact file paths included in all descriptions

## Path Conventions

Per plan.md Project Structure:
- Source: `src/` at repository root
- Tests: `tests/` at repository root
- Models: `src/models/`
- Services: `src/services/`
- CLI: `src/cli/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure creation

**Preconditions**: None
**Reference**: plan.md § Project Structure

- [x] T001 [CORE] Create project directory structure per plan.md
  - **Description**: Create `src/`, `src/models/`, `src/services/`, `src/cli/`, `tests/`, `tests/unit/`, `tests/integration/` directories
  - **Preconditions**: Repository exists
  - **Expected Output**: Directory structure matching plan.md § Source Code
  - **Artifacts**: Directories only (no files yet)
  - **Reference**: plan.md lines 58-83

- [x] T002 [P] [CORE] Create `__init__.py` files for all packages
  - **Description**: Create empty `__init__.py` in `src/`, `src/models/`, `src/services/`, `src/cli/`, `tests/`, `tests/unit/`, `tests/integration/`
  - **Preconditions**: T001 complete
  - **Expected Output**: Python recognizes all directories as packages
  - **Artifacts**: 7 `__init__.py` files
  - **Reference**: plan.md lines 61-82

- [x] T003 [P] [CORE] Create `requirements.txt` with pytest dependency
  - **Description**: Create `requirements.txt` with `pytest>=7.0.0` (only test dependency; no runtime dependencies per spec)
  - **Preconditions**: None
  - **Expected Output**: File exists at repository root
  - **Artifacts**: `requirements.txt`
  - **Reference**: plan.md § Technical Context (Testing: pytest)

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model and service infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Reference**: plan.md § Component Specifications, data-model.md, contracts/task-service.md

### 2.1 Model Layer

- [x] T004 [CORE] Create Task dataclass in `src/models/task.py`
  - **Description**: Implement Task dataclass with fields: id (int), title (str), description (str, default=""), is_complete (bool, default=False), created_at (datetime)
  - **Preconditions**: T001, T002 complete
  - **Expected Output**: Task class importable from `src.models.task`
  - **Artifacts**: `src/models/task.py`
  - **Reference**: data-model.md § Task entity, plan.md lines 132-142
  - **Validation**: Type hints on all fields, default values for description/is_complete

- [x] T005 [P] [CORE] Write unit tests for Task model in `tests/unit/test_task.py`
  - **Description**: Test Task creation with all fields, default values, type correctness
  - **Preconditions**: T004 complete
  - **Expected Output**: Tests pass when run with `pytest tests/unit/test_task.py`
  - **Artifacts**: `tests/unit/test_task.py`
  - **Reference**: plan.md § Testing Strategy
  - **Test Cases**:
    - Create Task with all fields explicit
    - Create Task with defaults (description="", is_complete=False)
    - Verify created_at is datetime type

### 2.2 Service Layer - Core Structure

- [x] T006 [CORE] Create TaskManager class skeleton in `src/services/task_manager.py`
  - **Description**: Create TaskManager class with `__init__`, `_tasks: Dict[int, Task] = {}`, `_next_id: int = 1`
  - **Preconditions**: T004 complete
  - **Expected Output**: TaskManager importable, initializes with empty storage
  - **Artifacts**: `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § Constructor, plan.md lines 144-162

- [x] T007 [CORE] Implement `add_task()` method in TaskManager
  - **Description**: Implement `add_task(title: str, description: str = "") -> Task` per contract
  - **Preconditions**: T006 complete
  - **Expected Output**: Returns new Task with auto-incremented ID
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § add_task, spec.md FR-001, FR-002
  - **Validation**:
    - Raise ValueError if title empty/whitespace
    - Increment _next_id before use
    - Store task in _tasks dict

- [x] T008 [CORE] Implement `get_all_tasks()` method in TaskManager
  - **Description**: Implement `get_all_tasks() -> List[Task]` returning tasks in creation order
  - **Preconditions**: T006 complete
  - **Expected Output**: Returns list of all tasks (empty list if none)
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § get_all_tasks, spec.md FR-003

- [x] T009 [CORE] Implement `get_task()` method in TaskManager
  - **Description**: Implement `get_task(task_id: int) -> Optional[Task]`
  - **Preconditions**: T006 complete
  - **Expected Output**: Returns Task if found, None if not found
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § get_task

- [x] T010 [CORE] Implement `update_task()` method in TaskManager
  - **Description**: Implement `update_task(task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]`
  - **Preconditions**: T009 complete
  - **Expected Output**: Returns updated Task or None if not found
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § update_task, spec.md FR-004
  - **Validation**:
    - Raise ValueError if new title is empty/whitespace
    - Preserve existing values if parameter is None

- [x] T011 [CORE] Implement `delete_task()` method in TaskManager
  - **Description**: Implement `delete_task(task_id: int) -> Optional[Task]`
  - **Preconditions**: T006 complete
  - **Expected Output**: Returns deleted Task for confirmation, None if not found
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § delete_task, spec.md FR-005

- [x] T012 [CORE] Implement `mark_complete()` method in TaskManager
  - **Description**: Implement `mark_complete(task_id: int) -> Optional[Task]`
  - **Preconditions**: T009 complete
  - **Expected Output**: Returns updated Task with is_complete=True, None if not found
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § mark_complete, spec.md FR-006

- [x] T013 [CORE] Implement `mark_incomplete()` method in TaskManager
  - **Description**: Implement `mark_incomplete(task_id: int) -> Optional[Task]`
  - **Preconditions**: T009 complete
  - **Expected Output**: Returns updated Task with is_complete=False, None if not found
  - **Artifacts**: Modify `src/services/task_manager.py`
  - **Reference**: contracts/task-service.md § mark_incomplete, spec.md FR-006

### 2.3 Service Layer - Unit Tests

- [x] T014 [CORE] Write unit tests for TaskManager in `tests/unit/test_task_manager.py`
  - **Description**: Comprehensive tests for all TaskManager methods
  - **Preconditions**: T007-T013 complete
  - **Expected Output**: All tests pass with `pytest tests/unit/test_task_manager.py`
  - **Artifacts**: `tests/unit/test_task_manager.py`
  - **Reference**: plan.md § Testing Strategy, spec.md § Acceptance Scenarios
  - **Test Cases**:
    - add_task with title only
    - add_task with title and description
    - add_task rejects empty title (ValueError)
    - add_task rejects whitespace-only title (ValueError)
    - get_all_tasks returns empty list initially
    - get_all_tasks returns tasks in order
    - get_task returns task by ID
    - get_task returns None for invalid ID
    - update_task updates title
    - update_task updates description
    - update_task preserves unchanged fields
    - update_task rejects empty title
    - update_task returns None for invalid ID
    - delete_task removes task
    - delete_task returns None for invalid ID
    - mark_complete sets is_complete=True
    - mark_incomplete sets is_complete=False
    - IDs never reused after delete

**Checkpoint**: Foundation ready - TaskManager fully implemented and tested

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal**: User can add new tasks with title and optional description
**Reference**: spec.md § User Story 1

**Independent Test**: Run app, select "Add Task", enter details, verify confirmation message

### Implementation for User Story 1

- [x] T015 [US1] Create CLI helper `get_non_empty_input()` in `src/cli/menu.py`
  - **Description**: Helper function to prompt user and validate non-empty input, with custom prompt text
  - **Preconditions**: Phase 2 complete
  - **Expected Output**: Returns stripped string or re-prompts if empty
  - **Artifacts**: `src/cli/menu.py`
  - **Reference**: spec.md FR-007, plan.md lines 180-182

- [x] T016 [US1] Implement `add_task_flow()` in `src/cli/menu.py`
  - **Description**: Handle add task interaction: prompt for title (required), description (optional), call manager.add_task(), display confirmation
  - **Preconditions**: T015 complete, T007 complete
  - **Expected Output**: Function takes TaskManager, prompts user, adds task, prints "Task added successfully! (ID: X)"
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § Add Task Flow, spec.md FR-001
  - **Error Handling**: Catch ValueError, display "Error: Task title cannot be empty."

**Checkpoint**: Add Task functionality complete

---

## Phase 4: User Story 2 - View Task List (Priority: P2)

**Goal**: User can view all tasks with IDs, titles, and completion status
**Reference**: spec.md § User Story 2

**Independent Test**: Add tasks, select "View Tasks", verify all tasks displayed with correct format

### Implementation for User Story 2

- [x] T017 [US2] Implement `format_task()` helper in `src/cli/menu.py`
  - **Description**: Format single task for display: `ID: X | [X] Title\n       Description: ...`
  - **Preconditions**: T004 complete
  - **Expected Output**: Returns formatted string per spec.md § View Tasks Flow
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md lines 191-199

- [x] T018 [US2] Implement `view_tasks_flow()` in `src/cli/menu.py`
  - **Description**: Display all tasks using format_task(), show summary (total, complete, incomplete), handle empty list
  - **Preconditions**: T017 complete, T008 complete
  - **Expected Output**: Prints formatted task list or "No tasks found. Add a task to get started!"
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § View Tasks Flow, spec.md FR-003

**Checkpoint**: View Tasks functionality complete

---

## Phase 5: User Story 3 - Mark Complete/Incomplete (Priority: P3)

**Goal**: User can toggle task completion status
**Reference**: spec.md § User Story 3

**Independent Test**: Add task, mark complete, view to verify [X], mark incomplete, verify [ ]

### Implementation for User Story 3

- [x] T019 [US3] Create CLI helper `get_task_id_input()` in `src/cli/menu.py`
  - **Description**: Prompt for task ID, validate numeric input, return int or display error
  - **Preconditions**: Phase 2 complete
  - **Expected Output**: Returns int task_id or None if invalid (with error message)
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md FR-008 (invalid ID format), plan.md lines 180-182

- [x] T020 [US3] Implement `mark_complete_flow()` in `src/cli/menu.py`
  - **Description**: Prompt for task ID, call manager.mark_complete(), display confirmation or "Task not found"
  - **Preconditions**: T019 complete, T012 complete
  - **Expected Output**: Prints "Task 'X' marked as complete!" or error
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § Mark Complete/Incomplete Flow, spec.md FR-006

- [x] T021 [US3] Implement `mark_incomplete_flow()` in `src/cli/menu.py`
  - **Description**: Prompt for task ID, call manager.mark_incomplete(), display confirmation or "Task not found"
  - **Preconditions**: T019 complete, T013 complete
  - **Expected Output**: Prints "Task 'X' marked as incomplete!" or error
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § Mark Complete/Incomplete Flow, spec.md FR-006

**Checkpoint**: Mark Complete/Incomplete functionality complete

---

## Phase 6: User Story 4 - Update Task (Priority: P4)

**Goal**: User can update task title and/or description
**Reference**: spec.md § User Story 4

**Independent Test**: Add task, update title, view to verify change

### Implementation for User Story 4

- [x] T022 [US4] Implement `update_task_flow()` in `src/cli/menu.py`
  - **Description**: Prompt for ID, display current values, prompt for new title (Enter to keep), new description (Enter to keep), update via manager
  - **Preconditions**: T019 complete, T010 complete
  - **Expected Output**: Prints "Task updated successfully!" or "Task not found"
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § Update Task Flow, spec.md FR-004
  - **Error Handling**: Catch ValueError for empty title, display error, don't update

**Checkpoint**: Update Task functionality complete

---

## Phase 7: User Story 5 - Delete Task (Priority: P5)

**Goal**: User can delete tasks by ID
**Reference**: spec.md § User Story 5

**Independent Test**: Add task, delete by ID, view to verify removal

### Implementation for User Story 5

- [x] T023 [US5] Implement `delete_task_flow()` in `src/cli/menu.py`
  - **Description**: Prompt for task ID, call manager.delete_task(), display confirmation with task title or "Task not found"
  - **Preconditions**: T019 complete, T011 complete
  - **Expected Output**: Prints "Task 'X' deleted successfully!" or error
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md § Delete Task Flow, spec.md FR-005

**Checkpoint**: Delete Task functionality complete

---

## Phase 8: Application Shell (Menu Loop & Entry Point)

**Purpose**: Main menu display, input routing, and application lifecycle
**Reference**: spec.md § CLI Interaction Flow, plan.md § Component Specifications 4

### Implementation

- [x] T024 [CORE] Implement `display_menu()` in `src/cli/menu.py`
  - **Description**: Print main menu exactly as specified in spec.md § Main Menu Structure
  - **Preconditions**: None
  - **Expected Output**: Displays 7-option menu with header
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md lines 168-179

- [x] T025 [CORE] Implement `get_user_choice()` in `src/cli/menu.py`
  - **Description**: Prompt for choice, validate 1-7, return int or display error and re-prompt
  - **Preconditions**: None
  - **Expected Output**: Returns valid int 1-7
  - **Artifacts**: Modify `src/cli/menu.py`
  - **Reference**: spec.md FR-009, FR-012, plan.md lines 170-171
  - **Error Handling**: Display "Invalid choice. Please enter a number between 1 and 7."

- [x] T026 [CORE] Create main application loop in `src/main.py`
  - **Description**: Initialize TaskManager, loop: display_menu(), get_user_choice(), route to appropriate flow, exit on choice 7
  - **Preconditions**: All Phase 3-7 tasks complete, T024-T025 complete
  - **Expected Output**: Application runs interactively, exits cleanly on choice 7
  - **Artifacts**: `src/main.py`
  - **Reference**: plan.md lines 184-199, spec.md FR-009, FR-010
  - **Exit Message**: "Goodbye!"

- [x] T027 [CORE] Add `if __name__ == "__main__"` guard to `src/main.py`
  - **Description**: Ensure main() only runs when script executed directly
  - **Preconditions**: T026 complete
  - **Expected Output**: `python src/main.py` runs app, `import src.main` does not
  - **Artifacts**: Modify `src/main.py`
  - **Reference**: Python best practices

**Checkpoint**: Application is fully runnable

---

## Phase 9: Integration Testing

**Purpose**: Verify end-to-end flows work correctly
**Reference**: plan.md § Testing Strategy, spec.md § Acceptance Scenarios

- [x] T028 [CORE] Write integration tests in `tests/integration/test_cli_flow.py`
  - **Description**: Test complete user flows using mocked input/output
  - **Preconditions**: All implementation tasks complete
  - **Expected Output**: All integration tests pass
  - **Artifacts**: `tests/integration/test_cli_flow.py`
  - **Test Cases**:
    - Add task flow (title only)
    - Add task flow (title + description)
    - Add task flow (empty title rejection)
    - View tasks (with tasks)
    - View tasks (empty list)
    - Update task flow (change title)
    - Update task flow (invalid ID)
    - Delete task flow
    - Mark complete flow
    - Mark incomplete flow
    - Invalid menu choice handling
    - Exit flow

**Checkpoint**: All functionality verified through automated tests

---

## Phase 10: Polish & Validation

**Purpose**: Final verification and documentation

- [x] T029 [CORE] Run all tests and verify 100% pass rate
  - **Description**: Execute `pytest tests/` and ensure all tests pass
  - **Preconditions**: T028 complete
  - **Expected Output**: All tests green
  - **Artifacts**: None (verification only)

- [x] T030 [CORE] Manual validation against quickstart.md checklist
  - **Description**: Run through all items in quickstart.md § Validation Checklist
  - **Preconditions**: T029 complete
  - **Expected Output**: All checklist items verified
  - **Artifacts**: None (verification only)
  - **Reference**: quickstart.md § Validation Checklist

- [x] T031 [CORE] Verify error messages match spec exactly
  - **Description**: Test each error scenario and verify message matches spec.md § Error Messages
  - **Preconditions**: T029 complete
  - **Expected Output**: All error messages match specification
  - **Artifacts**: None (verification only)
  - **Reference**: spec.md lines 224-228

**Checkpoint**: Phase I implementation complete and validated

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
Phase 3-7 (User Stories) ← Can run sequentially P1→P2→P3→P4→P5
    ↓
Phase 8 (Application Shell)
    ↓
Phase 9 (Integration Testing)
    ↓
Phase 10 (Polish & Validation)
```

### Task Dependencies Within Phases

**Phase 2 (Foundational)**:
- T004 → T005, T006
- T006 → T007, T008, T009, T011, T012, T013
- T009 → T010, T012, T013
- T007-T013 → T014

**Phase 3-7 (User Stories)**:
- All depend on Phase 2 completion
- T015 → T016
- T017 → T018
- T019 → T020, T021, T022, T023

**Phase 8 (Application Shell)**:
- T024, T025 can run in parallel
- T024, T025, All US flows → T026 → T027

### Parallel Opportunities

- T002, T003 can run in parallel (after T001)
- T005 can run after T004 (parallel with T006)
- T024, T025 can run in parallel
- Unit tests can run continuously as features are added

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| 1 | T001-T003 | Project setup |
| 2 | T004-T014 | Model + Service foundation |
| 3 | T015-T016 | US1: Add Task |
| 4 | T017-T018 | US2: View Tasks |
| 5 | T019-T021 | US3: Mark Complete/Incomplete |
| 6 | T022 | US4: Update Task |
| 7 | T023 | US5: Delete Task |
| 8 | T024-T027 | Menu + Main loop |
| 9 | T028 | Integration tests |
| 10 | T029-T031 | Validation |

**Total Tasks**: 31
**Estimated Effort**: Sequential execution, all tasks are atomic and testable
