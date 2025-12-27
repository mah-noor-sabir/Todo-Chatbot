# Tasks: Enhanced Task Features

**Input**: Design documents from `/specs/002-enhanced-task-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Date**: 2025-12-28
**Status**: ✅ COMPLETE - All 114 tasks implemented

**Tests**: Tests are included as the feature involves comprehensive functionality validation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1-US8) from spec.md
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Task model: `src/models/task.py`
- Task service: `src/services/task_manager.py`
- CLI menu: `src/cli/menu.py`
- Entry point: `src/main.py`

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Verify project structure and dependencies are in place

- [x] T001 Verify Python 3.11+ installation and project structure in src/
- [x] T002 [P] Verify Rich library installed via `pip install rich>=13.0.0`
- [x] T003 [P] Verify pytest installed for testing in requirements.txt

---

## Phase 2: Foundational (Model Enhancements) ✅ COMPLETE

**Purpose**: Core model enhancements that ALL user stories depend on

- [x] T004 Add Priority enum (HIGH, MEDIUM, LOW) to src/models/task.py
- [x] T005 [P] Add Category enum (WORK, HOME, PERSONAL, HEALTH, FINANCE, OTHER) to src/models/task.py
- [x] T006 [P] Add Recurrence enum (NONE, DAILY, WEEKLY, MONTHLY) to src/models/task.py
- [x] T007 Add priority field with default MEDIUM to Task dataclass in src/models/task.py
- [x] T008 [P] Add category field with default OTHER to Task dataclass in src/models/task.py
- [x] T009 [P] Add tags field (List[str]) with default [] to Task dataclass in src/models/task.py
- [x] T010 [P] Add due_date field (Optional[datetime]) to Task dataclass in src/models/task.py
- [x] T011 [P] Add recurrence field with default NONE to Task dataclass in src/models/task.py
- [x] T012 [P] Add reminder_minutes field (int) with default 0 to Task dataclass in src/models/task.py
- [x] T013 Add updated_at field (Optional[datetime]) to Task dataclass in src/models/task.py

**Checkpoint**: ✅ Foundation ready - Task model has all new fields

---

## Phase 3: User Story 1 - Organize Tasks by Priority (Priority: P1) ✅ COMPLETE

**Goal**: Users can assign and view priority levels (High, Medium, Low) on tasks

**Spec Reference**: FR-001, FR-002, FR-006

### Tests for User Story 1

- [x] T014 [P] [US1] Unit test Priority enum values in tests/unit/test_task.py
- [x] T015 [P] [US1] Unit test task creation with priority defaults in tests/unit/test_task.py
- [x] T016 [P] [US1] Unit test priority assignment in tests/unit/test_task_manager.py

### Implementation for User Story 1

- [x] T017 [US1] Update TaskManager.add_task() to accept priority parameter in src/services/task_manager.py
- [x] T018 [US1] Update TaskManager.update_task() to accept priority parameter in src/services/task_manager.py
- [x] T019 [US1] Add PRIORITY_DISPLAY dict for visual indicators in src/cli/menu.py
- [x] T020 [US1] Add get_priority_input() function for user selection in src/cli/menu.py
- [x] T021 [US1] Update add_task_flow() to prompt for priority in src/cli/menu.py
- [x] T022 [US1] Update display_task_table() to show priority indicator in src/cli/menu.py
- [x] T023 [US1] Update update_task_flow() to allow priority change in src/cli/menu.py

**Checkpoint**: ✅ User Story 1 complete - Priority classification working

---

## Phase 4: User Story 2 - Categorize Tasks (Priority: P1) ✅ COMPLETE

**Goal**: Users can assign categories and custom tags to tasks

**Spec Reference**: FR-003, FR-004, FR-005, FR-006

### Tests for User Story 2

- [x] T024 [P] [US2] Unit test Category enum values in tests/unit/test_task.py
- [x] T025 [P] [US2] Unit test task creation with category defaults in tests/unit/test_task.py
- [x] T026 [P] [US2] Unit test tags field as empty list default in tests/unit/test_task.py
- [x] T027 [P] [US2] Integration test category/tag assignment in tests/integration/test_cli_flow.py

### Implementation for User Story 2

- [x] T028 [US2] Update TaskManager.add_task() to accept category and tags in src/services/task_manager.py
- [x] T029 [US2] Update TaskManager.update_task() to accept category and tags in src/services/task_manager.py
- [x] T030 [US2] Add TaskManager.get_all_tags() method in src/services/task_manager.py
- [x] T031 [US2] Add CATEGORY_DISPLAY dict for visual indicators in src/cli/menu.py
- [x] T032 [US2] Add get_category_input() function for user selection in src/cli/menu.py
- [x] T033 [US2] Add get_tags_input() function for comma-separated input in src/cli/menu.py
- [x] T034 [US2] Update add_task_flow() to prompt for category and tags in src/cli/menu.py
- [x] T035 [US2] Update display_task_table() to show category indicator and tags in src/cli/menu.py

**Checkpoint**: ✅ User Story 2 complete - Categories and tags working

---

## Phase 5: User Story 3 - Search Tasks (Priority: P2) ✅ COMPLETE

**Goal**: Users can search tasks by keyword across title, description, tags

**Spec Reference**: FR-007, FR-008

### Tests for User Story 3

- [x] T036 [P] [US3] Unit test Task.matches_search() method in tests/unit/test_task.py
- [x] T037 [P] [US3] Unit test TaskManager.search_tasks() in tests/unit/test_task_manager.py
- [x] T038 [P] [US3] Integration test search flow in tests/integration/test_cli_flow.py

### Implementation for User Story 3

- [x] T039 [US3] Add matches_search(keyword) method to Task in src/models/task.py
- [x] T040 [US3] Add TaskManager.search_tasks(keyword) method in src/services/task_manager.py
- [x] T041 [US3] Add search submenu option (option 1) in search_filter_flow() in src/cli/menu.py
- [x] T042 [US3] Handle empty search results with "No tasks found" message in src/cli/menu.py

**Checkpoint**: ✅ User Story 3 complete - Search functionality working

---

## Phase 6: User Story 4 - Filter Tasks (Priority: P2) ✅ COMPLETE

**Goal**: Users can filter tasks by status, priority, category, tag, overdue, due soon

**Spec Reference**: FR-009 to FR-015

### Tests for User Story 4

- [x] T043 [P] [US4] Unit test filter_by_status() in tests/unit/test_task_manager.py
- [x] T044 [P] [US4] Unit test filter_by_priority() in tests/unit/test_task_manager.py
- [x] T045 [P] [US4] Unit test filter_by_category() in tests/unit/test_task_manager.py
- [x] T046 [P] [US4] Unit test filter_by_tag() in tests/unit/test_task_manager.py
- [x] T047 [P] [US4] Unit test filter_overdue() in tests/unit/test_task_manager.py
- [x] T048 [P] [US4] Unit test filter_due_soon() in tests/unit/test_task_manager.py
- [x] T049 [P] [US4] Unit test advanced_filter() in tests/unit/test_task_manager.py
- [x] T050 [P] [US4] Integration test all filters in tests/integration/test_cli_flow.py

### Implementation for User Story 4

- [x] T051 [US4] Add TaskManager.filter_by_status(completed) method in src/services/task_manager.py
- [x] T052 [P] [US4] Add TaskManager.filter_by_priority(priority) method in src/services/task_manager.py
- [x] T053 [P] [US4] Add TaskManager.filter_by_category(category) method in src/services/task_manager.py
- [x] T054 [P] [US4] Add TaskManager.filter_by_tag(tag) method in src/services/task_manager.py
- [x] T055 [US4] Add Task.is_overdue() method in src/models/task.py
- [x] T056 [US4] Add TaskManager.filter_overdue() method in src/services/task_manager.py
- [x] T057 [US4] Add Task.is_due_soon(hours) method in src/models/task.py
- [x] T058 [US4] Add TaskManager.filter_due_soon(hours) method in src/services/task_manager.py
- [x] T059 [US4] Add TaskManager.advanced_filter(**kwargs) method in src/services/task_manager.py
- [x] T060 [US4] Add filter submenu options (2-8) in search_filter_flow() in src/cli/menu.py

**Checkpoint**: ✅ User Story 4 complete - All filters working

---

## Phase 7: User Story 5 - Sort Tasks (Priority: P2) ✅ COMPLETE

**Goal**: Users can sort tasks by due date, priority, alphabetically, creation date

**Spec Reference**: FR-016 to FR-019

### Tests for User Story 5

- [x] T061 [P] [US5] Unit test SortOrder enum in tests/unit/test_task_manager.py
- [x] T062 [P] [US5] Unit test sort by due date in tests/unit/test_task_manager.py
- [x] T063 [P] [US5] Unit test sort by priority in tests/unit/test_task_manager.py
- [x] T064 [P] [US5] Unit test sort alphabetically in tests/unit/test_task_manager.py
- [x] T065 [P] [US5] Integration test all sort options in tests/integration/test_cli_flow.py

### Implementation for User Story 5

- [x] T066 [US5] Add SortOrder enum (DUE_DATE, PRIORITY, ALPHABETICAL, CREATED) in src/services/task_manager.py
- [x] T067 [US5] Add TaskManager.sort_tasks(sort_by, reverse) method in src/services/task_manager.py
- [x] T068 [US5] Add sort_tasks_flow() function in src/cli/menu.py
- [x] T069 [US5] Add sort menu option (8) to main menu in src/cli/menu.py
- [x] T070 [US5] Update main.py to handle sort menu option in src/main.py

**Checkpoint**: ✅ User Story 5 complete - Sorting working

---

## Phase 8: User Story 6 - Set Due Dates with Time (Priority: P3) ✅ COMPLETE

**Goal**: Users can set due dates with optional times, see overdue/due soon indicators

**Spec Reference**: FR-020 to FR-024

### Tests for User Story 6

- [x] T071 [P] [US6] Unit test due date assignment in tests/unit/test_task.py
- [x] T072 [P] [US6] Unit test is_overdue() method in tests/unit/test_task.py
- [x] T073 [P] [US6] Unit test is_due_soon() method in tests/unit/test_task.py
- [x] T074 [P] [US6] Integration test due date display in tests/integration/test_cli_flow.py

### Implementation for User Story 6

- [x] T075 [US6] Update TaskManager.add_task() to accept due_date in src/services/task_manager.py
- [x] T076 [US6] Update TaskManager.update_task() to accept due_date in src/services/task_manager.py
- [x] T077 [US6] Add get_due_date_input() function parsing YYYY-MM-DD and HH:MM in src/cli/menu.py
- [x] T078 [US6] Update add_task_flow() to prompt for due date in src/cli/menu.py
- [x] T079 [US6] Update display_task_table() to show due date with overdue/due soon styling in src/cli/menu.py
- [x] T080 [US6] Apply end-of-day (23:59) default when time not specified in src/cli/menu.py

**Checkpoint**: ✅ User Story 6 complete - Due dates with visual indicators working

---

## Phase 9: User Story 7 - Create Recurring Tasks (Priority: P3) ✅ COMPLETE

**Goal**: Users can create recurring tasks that auto-reschedule on completion

**Spec Reference**: FR-027 to FR-031

### Tests for User Story 7

- [x] T081 [P] [US7] Unit test Recurrence enum values in tests/unit/test_task.py
- [x] T082 [P] [US7] Unit test get_next_due_date() daily in tests/unit/test_task.py
- [x] T083 [P] [US7] Unit test get_next_due_date() weekly in tests/unit/test_task.py
- [x] T084 [P] [US7] Unit test get_next_due_date() monthly with day overflow in tests/unit/test_task.py
- [x] T085 [P] [US7] Unit test recurring task completion creates next occurrence in tests/unit/test_task_manager.py
- [x] T086 [P] [US7] Integration test recurring task flow in tests/integration/test_cli_flow.py

### Implementation for User Story 7

- [x] T087 [US7] Add Task.get_next_due_date() method in src/models/task.py
- [x] T088 [US7] Update TaskManager.add_task() to accept recurrence in src/services/task_manager.py
- [x] T089 [US7] Add TaskManager._create_next_occurrence(task) method in src/services/task_manager.py
- [x] T090 [US7] Update TaskManager.mark_complete() to call _create_next_occurrence for recurring in src/services/task_manager.py
- [x] T091 [US7] Add get_recurrence_input() function in src/cli/menu.py
- [x] T092 [US7] Update add_task_flow() to prompt for recurrence (require due_date) in src/cli/menu.py
- [x] T093 [US7] Update mark_complete_flow() to show next occurrence info in src/cli/menu.py
- [x] T094 [US7] Add RECURRENCE_DISPLAY dict for visual indicators in src/cli/menu.py

**Checkpoint**: ✅ User Story 7 complete - Recurring tasks auto-rescheduling

---

## Phase 10: User Story 8 - Receive Due Date Reminders (Priority: P3) ✅ COMPLETE

**Goal**: Users see reminder alerts on application startup when tasks are within reminder window

**Spec Reference**: FR-025, FR-026

### Tests for User Story 8

- [x] T095 [P] [US8] Unit test Task.should_remind() method in tests/unit/test_task.py
- [x] T096 [P] [US8] Unit test TaskManager.get_tasks_with_reminders() in tests/unit/test_task_manager.py
- [x] T097 [P] [US8] Integration test reminder display in tests/integration/test_cli_flow.py

### Implementation for User Story 8

- [x] T098 [US8] Add Task.should_remind() method in src/models/task.py
- [x] T099 [US8] Update TaskManager.add_task() to accept reminder_minutes in src/services/task_manager.py
- [x] T100 [US8] Add TaskManager.get_tasks_with_reminders() method in src/services/task_manager.py
- [x] T101 [US8] Add get_reminder_input() function (0, 15, 30, 60, 1440 min) in src/cli/menu.py
- [x] T102 [US8] Update add_task_flow() to prompt for reminder (only if due_date set) in src/cli/menu.py
- [x] T103 [US8] Add check_and_display_reminders(manager) function in src/cli/menu.py
- [x] T104 [US8] Call check_and_display_reminders() on application startup in src/main.py

**Checkpoint**: ✅ User Story 8 complete - Reminders displaying on startup

---

## Phase 11: Polish & Cross-Cutting Concerns ✅ COMPLETE

**Purpose**: Final integration, statistics, and backward compatibility

- [x] T105 [P] Add TaskManager.get_statistics() method in src/services/task_manager.py
- [x] T106 [P] Add statistics_flow() function in src/cli/menu.py
- [x] T107 Add statistics menu option (9) to main menu in src/cli/menu.py
- [x] T108 Update main.py menu handler for all new options (0-9) in src/main.py
- [x] T109 [P] Add display_welcome() and display_goodbye() with Rich panels in src/cli/menu.py
- [x] T110 [P] Add Windows UTF-8 encoding fix at startup in src/cli/menu.py
- [x] T111 [P] Test backward compatibility - existing tasks get default values in tests/integration/test_cli_flow.py
- [x] T112 Run all tests: pytest tests/ -v
- [x] T113 Manual validation: run application and test all menu options
- [x] T114 Verify 56+ tests passing (unit + integration)

**Checkpoint**: ✅ All features complete and tested

---

## Final Status

### Test Results
- **56 tests passing** (11 unit/task + 25 unit/task_manager + 20 integration)
- All user stories validated
- Backward compatibility confirmed

### Implementation Summary

| Phase | Story | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Setup | 3 | ✅ |
| 2 | Foundational | 10 | ✅ |
| 3 | US1: Priority | 10 | ✅ |
| 4 | US2: Category | 12 | ✅ |
| 5 | US3: Search | 7 | ✅ |
| 6 | US4: Filter | 18 | ✅ |
| 7 | US5: Sort | 10 | ✅ |
| 8 | US6: Due Dates | 10 | ✅ |
| 9 | US7: Recurring | 14 | ✅ |
| 10 | US8: Reminders | 10 | ✅ |
| 11 | Polish | 10 | ✅ |
| **Total** | | **114** | **✅ ALL COMPLETE** |

### Files Modified

| File | Changes |
|------|---------|
| `src/models/task.py` | Priority, Category, Recurrence enums; enhanced Task dataclass with all fields and methods |
| `src/services/task_manager.py` | SortOrder; search, filter, sort, statistics, recurring task methods |
| `src/cli/menu.py` | Rich UI with all input flows, display functions, reminders |
| `src/main.py` | Updated menu handler for options 0-9 with reminder check |
| `tests/unit/test_task.py` | Task model tests |
| `tests/unit/test_task_manager.py` | Service layer tests |
| `tests/integration/test_cli_flow.py` | Integration tests for all features |

### Acceptance Criteria Met

- ✅ FR-001 to FR-034: All functional requirements implemented
- ✅ SC-001 to SC-010: All success criteria validated
- ✅ 8 User Stories: Complete and independently testable
- ✅ Backward Compatibility: Existing tasks receive defaults
