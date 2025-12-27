# Quickstart Guide: Enhanced Task Features

**Feature**: 002-enhanced-task-features
**Date**: 2025-12-28

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Installation

### 1. Clone/Navigate to Repository

```bash
cd C:\Users\Hp\Desktop\Todo-app
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- `rich>=13.0.0` - Professional console UI
- `pytest>=7.0.0` - Testing framework

### 3. Verify Installation

```bash
python -c "from rich import print; print('[green]Rich installed successfully![/]')"
```

## Running the Application

### From src Directory

```bash
cd src
python main.py
```

### Expected Output

```
╔════════════════════════════ Evolution Todo v2.0 ════════════════════════════╗
║                                                                             ║
║  Welcome to Evolution Todo!                                                 ║
║                                                                             ║
║  Your professional task management companion.                               ║
║  Now with search, filters, categories, tags & recurring tasks!              ║
║                                                                             ║
╚═════════════════════════════ Enhanced Console Edition ══════════════════════╝
```

## Feature Usage

### Menu Options

| Option | Feature | Description |
|--------|---------|-------------|
| 1 | Add Task | Create task with priority, category, tags, due date, recurrence |
| 2 | View Tasks | Display all tasks in formatted table |
| 3 | Search/Filter | Find tasks by keyword or criteria |
| 4 | Update Task | Modify any task field |
| 5 | Delete Task | Remove a task (with confirmation) |
| 6 | Mark Complete | Mark task done (auto-creates next for recurring) |
| 7 | Mark Incomplete | Reopen a completed task |
| 8 | Sort Tasks | Order by due date, priority, alphabetically, or created |
| 9 | Statistics | View task counts and breakdown |
| 0 | Exit | Close application |

### Adding a Task

1. Select option `1` (Add Task)
2. Enter task title (required)
3. Enter description (optional, press Enter to skip)
4. Select priority: `1` High, `2` Medium (default), `3` Low
5. Select category: `1-6` for Work, Home, Personal, Health, Finance, Other
6. Enter tags (comma-separated, optional)
7. Enter due date (YYYY-MM-DD or YYYY-MM-DD HH:MM, optional)
8. Select recurrence: `1` None, `2` Daily, `3` Weekly, `4` Monthly
9. Select reminder: `0` None, `1` 15min, `2` 30min, `3` 1hr, `4` 1day

### Search and Filter

Select option `3` to access:
1. Search by keyword (title, description, tags)
2. Filter by status (complete/incomplete)
3. Filter by priority (High/Medium/Low)
4. Filter by category
5. Filter by tag
6. Show overdue tasks
7. Show tasks due soon (24h)
8. Advanced filter (combine multiple criteria)

### Sorting Tasks

Select option `8` to sort by:
1. Due date (earliest first, no-date tasks last)
2. Priority (High → Medium → Low)
3. Alphabetically (A-Z by title)
4. Creation date (newest first)

## Running Tests

### All Tests

```bash
python -m pytest tests/ -v
```

### Unit Tests Only

```bash
python -m pytest tests/unit/ -v
```

### Integration Tests Only

```bash
python -m pytest tests/integration/ -v
```

### With Coverage

```bash
pip install pytest-cov
python -m pytest tests/ --cov=src --cov-report=term-missing
```

## Project Structure

```
Todo-app/
├── src/
│   ├── main.py              # Application entry point
│   ├── models/
│   │   └── task.py          # Task, Priority, Category, Recurrence
│   ├── services/
│   │   └── task_manager.py  # Business logic
│   └── cli/
│       └── menu.py          # Rich-based UI
├── tests/
│   ├── unit/
│   │   ├── test_task.py
│   │   └── test_task_manager.py
│   └── integration/
│       └── test_cli_flow.py
├── specs/
│   └── 002-enhanced-task-features/
│       ├── spec.md          # Requirements
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Design decisions
│       ├── data-model.md    # Entity definitions
│       └── quickstart.md    # This file
└── requirements.txt
```

## Common Tasks

### Create a Recurring Daily Task

```
1. Add Task
2. Title: "Daily standup"
3. Description: "Team sync meeting"
4. Priority: 1 (High)
5. Category: 1 (Work)
6. Tags: meeting,daily
7. Due date: 2025-12-29 09:00
8. Recurrence: 2 (Daily)
9. Reminder: 2 (30 minutes)
```

### Find All High Priority Work Tasks

```
3. Search/Filter
8. Advanced filter
   - Status: all
   - Priority: Yes → 1 (High)
   - Category: Yes → 1 (Work)
```

### View Statistics

```
9. Statistics
```

Shows:
- Total/Complete/Incomplete counts
- Overdue count
- Recurring tasks count
- Breakdown by priority
- Breakdown by category
- All used tags

## Troubleshooting

### Unicode/Emoji Display Issues (Windows)

The application automatically configures UTF-8 encoding on Windows. If you still see garbled characters:

```bash
# Set console to UTF-8
chcp 65001
# Then run the app
python main.py
```

### ModuleNotFoundError

Ensure you're running from the `src` directory:

```bash
cd src
python main.py
```

Or set PYTHONPATH:

```bash
set PYTHONPATH=src
python src/main.py
```

### Rich Not Installed

```bash
pip install rich>=13.0.0
```

## API Reference (For Developers)

### TaskManager Methods

```python
# CRUD
add_task(title, description="", priority=MEDIUM, category=OTHER,
         tags=[], due_date=None, recurrence=NONE, reminder_minutes=0) -> Task
get_task(task_id: int) -> Task | None
get_all_tasks() -> List[Task]
update_task(task_id, **fields) -> Task | None
delete_task(task_id: int) -> Task | None
mark_complete(task_id: int) -> Task | None
mark_incomplete(task_id: int) -> Task | None

# Search & Filter
search_tasks(keyword: str) -> List[Task]
filter_by_status(completed: bool) -> List[Task]
filter_by_priority(priority: Priority) -> List[Task]
filter_by_category(category: Category) -> List[Task]
filter_by_tag(tag: str) -> List[Task]
filter_overdue() -> List[Task]
filter_due_soon(within_hours: int = 24) -> List[Task]
advanced_filter(**criteria) -> List[Task]

# Sort
sort_tasks(sort_by: SortOrder, reverse: bool = False) -> List[Task]

# Statistics
get_statistics() -> Dict
get_all_tags() -> List[str]
get_tasks_with_reminders() -> List[Task]
```

### Task Methods

```python
is_overdue() -> bool
is_due_soon(within_hours: int = 24) -> bool
should_remind() -> bool
get_next_due_date() -> datetime | None
matches_search(keyword: str) -> bool
```
