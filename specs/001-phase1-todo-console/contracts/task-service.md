# Service Contract: TaskManager

**Feature Branch**: `001-phase1-todo-console`
**Date**: 2025-12-27
**Type**: Internal Service Interface (not REST API)

## Overview

Since Phase I is a console application with no web interface, this document defines the internal service contract for the `TaskManager` class. This service layer separates business logic from CLI interaction.

## Service Interface

### TaskManager

The central service class responsible for all task operations.

#### Constructor

```
TaskManager()
```

**Behavior**:
- Initializes empty task storage
- Sets ID counter to 0

---

#### add_task

```
add_task(title: str, description: str = "") -> Task
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | str | Yes | Task title (non-empty) |
| description | str | No | Optional description |

**Returns**: `Task` - The newly created task with assigned ID

**Errors**:
| Condition | Error Type | Message |
|-----------|------------|---------|
| Empty title | ValueError | "Task title cannot be empty" |
| Whitespace-only title | ValueError | "Task title cannot be empty" |

**Side Effects**:
- Increments ID counter
- Stores new task in memory

---

#### get_all_tasks

```
get_all_tasks() -> List[Task]
```

**Parameters**: None

**Returns**: `List[Task]` - All tasks in creation order (oldest first)

**Errors**: None (returns empty list if no tasks)

**Side Effects**: None (read-only)

---

#### get_task

```
get_task(task_id: int) -> Optional[Task]
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | int | Yes | Task ID to retrieve |

**Returns**: `Task` if found, `None` if not found

**Errors**: None (returns None for missing ID)

**Side Effects**: None (read-only)

---

#### update_task

```
update_task(task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | int | Yes | Task ID to update |
| title | str | None | No | New title (if provided) |
| description | str | None | No | New description (if provided) |

**Returns**: Updated `Task` if successful, `None` if task not found

**Errors**:
| Condition | Error Type | Message |
|-----------|------------|---------|
| Empty/whitespace title | ValueError | "Task title cannot be empty" |
| Task not found | - | Returns None |

**Side Effects**: Modifies task in storage

**Behavior Notes**:
- If `title` is `None`, current title is preserved
- If `description` is `None`, current description is preserved
- If both are `None`, no changes made (valid operation)

---

#### delete_task

```
delete_task(task_id: int) -> Optional[Task]
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | int | Yes | Task ID to delete |

**Returns**: Deleted `Task` if successful (for confirmation message), `None` if not found

**Errors**: None (returns None for missing ID)

**Side Effects**: Removes task from storage (ID is never reused)

---

#### mark_complete

```
mark_complete(task_id: int) -> Optional[Task]
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | int | Yes | Task ID to mark complete |

**Returns**: Updated `Task` if successful, `None` if not found

**Errors**: None (returns None for missing ID)

**Side Effects**: Sets `is_complete = True`

**Behavior Notes**:
- Idempotent: marking an already-complete task as complete is valid (no error)

---

#### mark_incomplete

```
mark_incomplete(task_id: int) -> Optional[Task]
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| task_id | int | Yes | Task ID to mark incomplete |

**Returns**: Updated `Task` if successful, `None` if not found

**Errors**: None (returns None for missing ID)

**Side Effects**: Sets `is_complete = False`

**Behavior Notes**:
- Idempotent: marking an already-incomplete task as incomplete is valid (no error)

---

## Usage Example

```python
# Initialize service
manager = TaskManager()

# Add tasks
task1 = manager.add_task("Buy groceries", "Weekly shopping")
task2 = manager.add_task("Complete report")

# View all tasks
all_tasks = manager.get_all_tasks()  # [task1, task2]

# Update a task
updated = manager.update_task(1, title="Buy organic groceries")

# Mark complete
manager.mark_complete(1)

# Delete a task
deleted = manager.delete_task(2)

# Handle not found
result = manager.get_task(999)  # Returns None
```

## Error Handling Contract

The CLI layer is responsible for:
1. Converting user string input to `int` for task IDs
2. Handling `ValueError` from invalid titles
3. Checking `None` returns for "task not found" scenarios
4. Displaying appropriate user-friendly error messages

The Service layer:
1. Validates business rules (non-empty titles)
2. Returns `None` for not-found conditions (no exceptions)
3. Raises `ValueError` for invalid input data
