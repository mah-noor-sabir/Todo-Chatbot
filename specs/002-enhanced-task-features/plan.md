# Implementation Plan: Enhanced Task Features

**Branch**: `002-enhanced-task-features` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-enhanced-task-features/spec.md`

## Summary

Implement comprehensive task organization, automation, and discovery features for the Phase I console Todo application. This includes priority/category classification, search/filter/sort capabilities, recurring tasks with auto-scheduling, and due date reminders. The implementation uses Python with Rich library for professional console UI, maintaining in-memory storage and single-user operation per constitution Phase I boundaries.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: Rich (CLI formatting), dataclasses (models), datetime (temporal operations)
**Storage**: In-memory (Dict[int, Task]) - Phase I boundary
**Testing**: pytest with unit/integration test structure
**Target Platform**: Console/CLI (Windows, macOS, Linux)
**Project Type**: Single project (console application)
**Performance Goals**: Sub-second response for all operations, instant UI feedback
**Constraints**: Console-based only, no GUI, no network, no database persistence
**Scale/Scope**: Single-user, in-memory storage, ~100-1000 tasks practical limit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| Spec-Driven Development | PASS | Following SDD flow: Constitution (v1.1.0) → Spec (approved) → Plan (this doc) → Tasks → Implement |
| Agent Behavior Rules | PASS | No feature invention beyond spec, clarifications resolved in spec phase |
| Phase Governance | PASS | All features within Phase I scope as defined in constitution v1.1.0 |
| Technology Constraints | PASS | Python 3.11+, Rich CLI library, in-memory storage - all Phase I compliant |
| Quality Principles | PASS | Clean architecture (models/services/cli layers), stateless services permitted for Phase I |

### Phase I Boundary Validation

| Boundary | Compliance |
|----------|------------|
| Console-based only | PASS - No GUI components |
| In-memory storage | PASS - Dict-based storage, no database |
| Single-user operation | PASS - No multi-user considerations |
| No network functionality | PASS - No API calls or remote storage |

## Project Structure

### Documentation (this feature)

```text
specs/002-enhanced-task-features/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A for console app (no API)
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── task.py          # Task, Priority, Category, Recurrence entities
├── services/
│   └── task_manager.py  # Business logic, CRUD, search/filter/sort
├── cli/
│   └── menu.py          # Rich-based UI, user interaction flows
└── main.py              # Application entry point

tests/
├── integration/
│   └── test_cli_flow.py # End-to-end flow tests
└── unit/
    ├── test_task.py     # Task model unit tests
    └── test_task_manager.py # Service layer unit tests
```

**Structure Decision**: Single project structure (Option 1) - console application with clear separation between models, services, and CLI layers.

## Complexity Tracking

> No constitution violations - all features within Phase I scope.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Storage | In-memory Dict | Phase I boundary; simple, fast, no persistence needed |
| UI Library | Rich | Constitution mandates Rich for professional console output |
| Architecture | 3-layer (models/services/cli) | Clean separation per Quality Principles |

## Implementation Architecture

### Layer Responsibilities

```text
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  menu.py: User prompts, Rich formatting, input validation    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  task_manager.py: CRUD, search, filter, sort, statistics     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Model Layer                           │
│  task.py: Task dataclass, Priority/Category/Recurrence enums │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → CLI Layer validates and parses
2. **CLI Layer** → Calls Service Layer methods
3. **Service Layer** → Operates on Model objects in storage
4. **Service Layer** → Returns results to CLI
5. **CLI Layer** → Formats and displays with Rich

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ID Generation | Auto-increment, never reuse | Spec requirement, prevents confusion |
| Default Priority | Medium | Spec FR-002 |
| Default Category | Other | Spec FR-004 |
| Due Date Without Time | End of day (23:59) | Spec FR-022 |
| Recurring Task Creation | On completion | Spec FR-029 |
| Search Matching | Case-insensitive | Spec FR-008 |
| Sort: No Due Date | Last in list | Spec edge case |

## Feature Implementation Map

### Priority 1 (P1) Features

| Feature | Model Changes | Service Methods | CLI Updates |
|---------|---------------|-----------------|-------------|
| Priority Classification | `Priority` enum, `priority` field | `add_task()`, `update_task()` | Priority input prompt |
| Category Organization | `Category` enum, `category` field | `add_task()`, `update_task()` | Category input prompt |
| Tags Support | `tags: List[str]` field | `add_task()`, `update_task()`, `get_all_tags()` | Tags input prompt |

### Priority 2 (P2) Features

| Feature | Model Changes | Service Methods | CLI Updates |
|---------|---------------|-----------------|-------------|
| Keyword Search | `matches_search()` method | `search_tasks()` | Search submenu |
| Status Filter | - | `filter_by_status()` | Filter submenu |
| Priority Filter | - | `filter_by_priority()` | Filter submenu |
| Category Filter | - | `filter_by_category()` | Filter submenu |
| Tag Filter | - | `filter_by_tag()` | Filter submenu |
| Overdue Filter | `is_overdue()` method | `filter_overdue()` | Filter submenu |
| Due Soon Filter | `is_due_soon()` method | `filter_due_soon()` | Filter submenu |
| Advanced Filter | - | `advanced_filter()` | Filter submenu |
| Sort by Due Date | - | `sort_tasks(DUE_DATE)` | Sort submenu |
| Sort by Priority | - | `sort_tasks(PRIORITY)` | Sort submenu |
| Sort Alphabetically | - | `sort_tasks(ALPHABETICAL)` | Sort submenu |
| Sort by Created | - | `sort_tasks(CREATED)` | Sort submenu |

### Priority 3 (P3) Features

| Feature | Model Changes | Service Methods | CLI Updates |
|---------|---------------|-----------------|-------------|
| Due Dates with Time | `due_date: Optional[datetime]` | `add_task()`, `update_task()` | Due date prompt |
| Overdue Indicator | `is_overdue()` method | - | Table styling |
| Due Soon Indicator | `is_due_soon()` method | - | Table styling |
| Recurring Tasks | `Recurrence` enum, `recurrence` field | `mark_complete()` creates next | Recurrence prompt |
| Auto-reschedule | `get_next_due_date()` method | `_create_next_occurrence()` | Info message |
| Reminders | `reminder_minutes` field, `should_remind()` | `get_tasks_with_reminders()` | Startup alerts |

## Testing Strategy

### Unit Tests (tests/unit/)

| Test File | Coverage |
|-----------|----------|
| test_task.py | Task creation, defaults, Priority/Category/Recurrence enums, is_overdue(), is_due_soon(), should_remind(), get_next_due_date(), matches_search() |
| test_task_manager.py | CRUD operations, ID generation, search, all filters, all sorts, statistics, recurring task creation |

### Integration Tests (tests/integration/)

| Test Class | Coverage |
|------------|----------|
| TestTaskManagerIntegration | Full field task creation, recurring task flow |
| TestSearchAndFilter | All search/filter combinations |
| TestSorting | All sort orders |
| TestStatistics | Statistics calculation |
| TestReminders | Reminder triggering |
| TestBackwardCompatibility | Default values for existing tasks |

### Acceptance Criteria Mapping

| Spec Requirement | Test Coverage |
|------------------|---------------|
| FR-001 to FR-006 | test_task.py, TestBackwardCompatibility |
| FR-007 to FR-015 | TestSearchAndFilter |
| FR-016 to FR-019 | TestSorting |
| FR-020 to FR-026 | test_task.py (is_overdue, is_due_soon, should_remind) |
| FR-027 to FR-031 | TestTaskManagerIntegration (recurring) |
| FR-032 to FR-034 | TestBackwardCompatibility |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Date edge cases (month boundaries) | Medium | Low | Comprehensive date handling in get_next_due_date() |
| Rich library encoding issues | Medium | Low | UTF-8 reconfiguration on Windows startup |
| Performance with large task lists | Low | Low | In-memory Dict provides O(1) lookup |

## Success Metrics

Per specification success criteria (SC-001 to SC-010):

- Task creation with all fields: < 60 seconds (SC-001)
- Search response: < 5 seconds (SC-002)
- Filter response: < 3 seconds (SC-003)
- Sort response: < 2 seconds (SC-004)
- Recurring task creation: 100% automatic (SC-005)
- Reminder display: 100% when in window (SC-006)
- Visual indicators: Overdue/High priority visible at glance (SC-007, SC-008)
- Backward compatibility: 100% existing tasks work (SC-009)

## Next Steps

1. **Phase 0**: Generate research.md (no outstanding clarifications)
2. **Phase 1**: Generate data-model.md with entity definitions
3. **Phase 1**: Generate quickstart.md for developer onboarding
4. **Phase 2**: Run `/sp.tasks` to generate implementable task list
