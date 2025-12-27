# Data Model: Phase I Todo Console Application

**Feature Branch**: `001-phase1-todo-console`
**Date**: 2025-12-27
**Source**: Derived from spec.md Key Entities section

## Entities

### Task

Represents a single todo item in the application.

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| id | int | Yes | Auto-generated | Unique, positive, never reused, auto-incrementing |
| title | str | Yes | - | Non-empty, non-whitespace-only |
| description | str | No | "" | Any string allowed, including empty |
| is_complete | bool | Yes | False | True = complete, False = incomplete |
| created_at | datetime | Yes | Current time | Set at creation, immutable |

**Validation Rules**:
- `title` MUST NOT be empty or whitespace-only
- `id` MUST be unique across all tasks (including deleted ones)
- `id` MUST be a positive integer
- `created_at` MUST NOT be modified after creation

**State Transitions**:
```
[Created] --> is_complete: False
     |
     v
[Mark Complete] --> is_complete: True
     |
     v
[Mark Incomplete] --> is_complete: False
     |
     v
(can toggle indefinitely)
```

## Storage Structure

### In-Memory Store

**Structure**: `Dict[int, Task]`

```python
{
    1: Task(id=1, title="Buy groceries", description="", is_complete=False, created_at=...),
    2: Task(id=2, title="Complete report", description="Q4 summary", is_complete=True, created_at=...),
    # ...
}
```

**Properties**:
- Keys are task IDs (int)
- Values are Task instances
- Iteration order = insertion order (Python 3.7+)
- Empty dict at application start

### ID Counter

**Structure**: `int` (module-level or class attribute)

**Behavior**:
- Starts at 0
- Incremented BEFORE creating each new task
- Never decremented (even on delete)
- Result: First task gets ID 1, second gets ID 2, etc.

## Operations Mapping

| Operation | Input | Output | Storage Change |
|-----------|-------|--------|----------------|
| Add Task | title, description? | Task with new ID | Insert new Task |
| View Tasks | - | List[Task] | None (read-only) |
| Update Task | id, title?, description? | Updated Task | Modify existing Task |
| Delete Task | id | Deleted Task (for confirmation) | Remove from dict |
| Mark Complete | id | Updated Task | Set is_complete=True |
| Mark Incomplete | id | Updated Task | Set is_complete=False |

## Error Conditions

| Condition | Trigger | Expected Behavior |
|-----------|---------|-------------------|
| Task not found | ID doesn't exist in storage | Return None or raise custom exception |
| Empty title | title.strip() == "" | Reject operation, return error |
| Invalid ID format | Non-numeric input | Handle at CLI layer before reaching storage |

## Data Lifecycle

```
Application Start
      |
      v
Empty storage: {} , counter: 0
      |
      v
[User adds tasks] --> Tasks accumulate in memory
      |
      v
[User performs operations] --> State changes in memory
      |
      v
Application Exit
      |
      v
All data lost (no persistence in Phase I)
```

## Future Considerations (Phase II+)

> **Note**: These are NOT implemented in Phase I. Documented for architecture awareness only.

- Phase II may add `user_id` field for multi-user support
- Phase II+ may add persistence (database mapping)
- Task entity structure is designed to be compatible with future SQLModel migration
