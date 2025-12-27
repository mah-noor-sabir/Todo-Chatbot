# Quickstart: Phase I Todo Console Application

**Feature Branch**: `001-phase1-todo-console`
**Date**: 2025-12-27

## Prerequisites

- Python 3.11 or higher installed
- Terminal/command prompt access

## Installation

No installation required. The application uses only Python standard library.

```bash
# Verify Python version
python --version  # Should be 3.11+
```

## Running the Application

```bash
# From repository root
python src/main.py
```

## Basic Usage

### Main Menu

When you start the application, you'll see:

```
=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7):
```

### Adding a Task

1. Select option `1`
2. Enter a task title (required)
3. Enter a description (optional, press Enter to skip)

```
Enter your choice (1-7): 1
Enter task title: Buy groceries
Enter description (press Enter to skip): Weekly shopping list
> Task added successfully! (ID: 1)
```

### Viewing Tasks

Select option `2` to see all your tasks:

```
Enter your choice (1-7): 2

=== Your Tasks ===
ID: 1 | [ ] Buy groceries
       Description: Weekly shopping list
---
Total: 1 task (0 complete, 1 incomplete)
```

### Marking a Task Complete

1. Select option `5`
2. Enter the task ID

```
Enter your choice (1-7): 5
Enter task ID: 1
> Task "Buy groceries" marked as complete!
```

### Updating a Task

1. Select option `3`
2. Enter the task ID
3. Enter new title (or press Enter to keep current)
4. Enter new description (or press Enter to keep current)

```
Enter your choice (1-7): 3
Enter task ID to update: 1
Current title: Buy groceries
Enter new title (press Enter to keep current): Buy organic groceries
Current description: Weekly shopping list
Enter new description (press Enter to keep current):
> Task updated successfully!
```

### Deleting a Task

1. Select option `4`
2. Enter the task ID

```
Enter your choice (1-7): 4
Enter task ID to delete: 1
> Task "Buy organic groceries" deleted successfully!
```

### Exiting

Select option `7` to exit:

```
Enter your choice (1-7): 7
Goodbye!
```

## Common Scenarios

### Scenario 1: Create and Complete Tasks

```
1. Add Task → "Complete Phase I implementation"
2. Add Task → "Write tests"
3. Add Task → "Update documentation"
4. View Tasks → See all 3 tasks
5. Mark Complete → ID 1
6. View Tasks → Task 1 shows [X]
```

### Scenario 2: Update a Mistake

```
1. Add Task → "Buy grocries" (typo!)
2. Update Task → ID 1 → "Buy groceries"
3. View Tasks → Corrected title shown
```

## Error Handling

### Invalid Menu Choice

```
Enter your choice (1-7): 9
Invalid choice. Please enter a number between 1 and 7.
```

### Empty Task Title

```
Enter task title:
Error: Task title cannot be empty.
```

### Task Not Found

```
Enter task ID: 999
Error: Task with ID 999 not found.
```

### Invalid ID Format

```
Enter task ID: abc
Error: Please enter a valid numeric ID.
```

## Important Notes

1. **No Persistence**: All tasks are lost when you exit the application
2. **IDs Never Reused**: If you delete task #1 and add a new task, it gets #2 (not #1)
3. **Single User**: This application is designed for one user at a time

## Validation Checklist

Use this to verify the application works correctly:

- [ ] Can add a task with title only
- [ ] Can add a task with title and description
- [ ] Cannot add a task with empty title
- [ ] Can view all tasks (shows IDs, titles, status)
- [ ] Can view empty task list (shows appropriate message)
- [ ] Can mark task complete
- [ ] Can mark task incomplete
- [ ] Can update task title
- [ ] Can update task description
- [ ] Can delete a task
- [ ] Error shown for invalid task ID
- [ ] Error shown for non-numeric ID input
- [ ] Exit works cleanly
