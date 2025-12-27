# Data Model: Enhanced Task Features

**Feature**: 002-enhanced-task-features
**Date**: 2025-12-28
**Status**: Complete

## Entity Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                          Task                                │
├─────────────────────────────────────────────────────────────┤
│  id: int (PK, auto-increment, never reused)                  │
│  title: str (required, non-empty)                            │
│  description: str (optional, default: "")                    │
│  is_complete: bool (default: False)                          │
│  priority: Priority (default: MEDIUM)                        │
│  category: Category (default: OTHER)                         │
│  tags: List[str] (default: [])                               │
│  created_at: datetime (auto-set on creation)                 │
│  updated_at: datetime | None (set on update)                 │
│  due_date: datetime | None (optional)                        │
│  recurrence: Recurrence (default: NONE)                      │
│  reminder_minutes: int (default: 0)                          │
├─────────────────────────────────────────────────────────────┤
│  is_overdue() -> bool                                        │
│  is_due_soon(within_hours: int = 24) -> bool                 │
│  should_remind() -> bool                                     │
│  get_next_due_date() -> datetime | None                      │
│  matches_search(keyword: str) -> bool                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Priority     │  │    Category     │  │   Recurrence    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│  HIGH = "high"  │  │  WORK = "work"  │  │  NONE = "none"  │
│  MEDIUM = "med" │  │  HOME = "home"  │  │  DAILY = "daily"│
│  LOW = "low"    │  │  PERSONAL       │  │  WEEKLY         │
│                 │  │  HEALTH         │  │  MONTHLY        │
│                 │  │  FINANCE        │  │                 │
│                 │  │  OTHER          │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Entity Definitions

### Task

The core entity representing a single todo item.

| Field | Type | Required | Default | Validation | Source |
|-------|------|----------|---------|------------|--------|
| id | int | Yes | Auto | > 0, unique, never reused | System |
| title | str | Yes | - | Non-empty after strip | User |
| description | str | No | "" | Any string | User |
| is_complete | bool | No | False | - | System/User |
| priority | Priority | No | MEDIUM | Valid enum value | User |
| category | Category | No | OTHER | Valid enum value | User |
| tags | List[str] | No | [] | List of non-empty strings | User |
| created_at | datetime | Yes | now() | Auto-set | System |
| updated_at | datetime | No | None | Set on any update | System |
| due_date | datetime | No | None | If date only, set to 23:59 | User |
| recurrence | Recurrence | No | NONE | Requires due_date if not NONE | User |
| reminder_minutes | int | No | 0 | >= 0 | User |

#### Business Rules

1. **ID Assignment**: IDs auto-increment from 1, never reused after deletion
2. **Title Validation**: Must be non-empty after whitespace trimming
3. **Due Date Default**: If time not specified, defaults to 23:59 (end of day)
4. **Recurrence Requirement**: Tasks with recurrence != NONE must have a due_date
5. **Reminder Activation**: Reminder only triggers if due_date exists and task not complete

#### Computed Properties

| Method | Returns | Logic |
|--------|---------|-------|
| `is_overdue()` | bool | `due_date < now AND NOT is_complete` |
| `is_due_soon(hours)` | bool | `0 < (due_date - now) <= hours AND NOT is_complete` |
| `should_remind()` | bool | `0 < (due_date - now) <= reminder_minutes AND NOT is_complete` |
| `get_next_due_date()` | datetime | Based on recurrence pattern |
| `matches_search(keyword)` | bool | Case-insensitive match in title/description/tags |

### Priority (Enum)

Task urgency classification.

| Value | String | Display | Color | Sort Order |
|-------|--------|---------|-------|------------|
| HIGH | "high" | [!] | bright_red | 1 (first) |
| MEDIUM | "medium" | [=] | bright_yellow | 2 |
| LOW | "low" | [-] | dim | 3 (last) |

### Category (Enum)

Task context classification.

| Value | String | Display | Color |
|-------|--------|---------|-------|
| WORK | "work" | W | bright_blue |
| HOME | "home" | H | bright_green |
| PERSONAL | "personal" | P | bright_magenta |
| HEALTH | "health" | + | bright_cyan |
| FINANCE | "finance" | $ | bright_yellow |
| OTHER | "other" | O | dim |

### Recurrence (Enum)

Task repetition pattern.

| Value | String | Next Date Calculation |
|-------|--------|-----------------------|
| NONE | "none" | N/A |
| DAILY | "daily" | due_date + 1 day |
| WEEKLY | "weekly" | due_date + 7 days |
| MONTHLY | "monthly" | due_date + 1 month (day capped at 28) |

## Storage Model

### In-Memory Structure

```python
class TaskManager:
    _tasks: Dict[int, Task]      # Primary storage: id -> Task
    _next_id: int                # Counter for ID generation (never decreases)
```

### Operations Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Add task | O(1) | O(1) |
| Get by ID | O(1) | O(1) |
| Get all | O(n) | O(n) |
| Delete | O(1) | O(1) |
| Search | O(n * m) | O(k) |
| Filter | O(n) | O(k) |
| Sort | O(n log n) | O(n) |

Where n = total tasks, m = avg text length, k = result count

## State Transitions

### Task Lifecycle

```text
                    ┌──────────────┐
                    │   Created    │
                    │ is_complete: │
                    │    False     │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Updated    │ │   Deleted    │ │  Completed   │
    │  (any field) │ │   (removed)  │ │ is_complete: │
    │              │ │              │ │    True      │
    └──────┬───────┘ └──────────────┘ └──────┬───────┘
           │                                  │
           │         ┌────────────────────────┤
           │         │                        │
           │         ▼                        ▼
           │  ┌──────────────┐         ┌──────────────┐
           │  │  Reopened    │         │ Next Created │
           │  │ is_complete: │         │ (if recurring)│
           │  │    False     │         └──────────────┘
           │  └──────────────┘
           │
           └───────────────────────────────────────┘
```

### Recurring Task Flow

```text
1. Task created with recurrence != NONE and due_date set
2. User marks task complete via mark_complete(id)
3. System:
   a. Sets original task is_complete = True
   b. Calculates next_due_date using get_next_due_date()
   c. Creates new task with:
      - Same title, description, priority, category, tags
      - Same recurrence and reminder_minutes
      - New ID (next available)
      - due_date = next_due_date
      - is_complete = False
```

## Validation Rules

### Creation Validation

| Field | Rule | Error |
|-------|------|-------|
| title | Non-empty after strip | "Task title cannot be empty" |
| recurrence | If != NONE, due_date required | "Recurring tasks require a due date" |

### Update Validation

| Field | Rule | Error |
|-------|------|-------|
| title | If provided, non-empty after strip | "Task title cannot be empty" |

### Constraints

1. **ID Uniqueness**: System-enforced, never user-provided
2. **Timestamp Management**: created_at auto-set, updated_at auto-set on any update
3. **Reminder Window**: Only meaningful when due_date exists

## Backward Compatibility

Per FR-032 to FR-034, existing tasks without new fields receive defaults:

| Scenario | Default Applied |
|----------|-----------------|
| No priority | Priority.MEDIUM |
| No category | Category.OTHER |
| No tags | [] (empty list) |
| No recurrence | Recurrence.NONE |
| No reminder | 0 (no reminder) |

## Code Location

| Entity | File Path |
|--------|-----------|
| Task | `src/models/task.py` |
| Priority | `src/models/task.py` |
| Category | `src/models/task.py` |
| Recurrence | `src/models/task.py` |
| TaskManager | `src/services/task_manager.py` |
