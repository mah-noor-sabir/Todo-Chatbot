"""TaskManager service for Todo Console Application.

Enhanced with search, filter, sort, and recurring task support.
"""

from datetime import datetime
from typing import Optional, List, Callable

from models.task import Task, Priority, Category, Recurrence


class SortOrder:
    """Sort order constants."""
    DUE_DATE = "due_date"
    PRIORITY = "priority"
    ALPHABETICAL = "alphabetical"
    CREATED = "created"


class TaskManager:
    """Central service class responsible for all task operations.

    Provides CRUD operations, search, filter, sort, and recurring task support.
    IDs are auto-incremented and never reused.
    """

    def __init__(self) -> None:
        """Initialize TaskManager with empty storage and ID counter starting at 1."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add_task(
        self,
        title: str,
        description: str = "",
        priority: Priority = Priority.MEDIUM,
        category: Category = Category.OTHER,
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        recurrence: Recurrence = Recurrence.NONE,
        reminder_minutes: int = 0
    ) -> Task:
        """Add a new task with the given parameters.

        Args:
            title: Task title (required, non-empty)
            description: Optional task description
            priority: Task priority level (default: MEDIUM)
            category: Task category (default: OTHER)
            tags: List of custom tags
            due_date: Optional deadline with time
            recurrence: Recurrence pattern (default: NONE)
            reminder_minutes: Minutes before due to remind (default: 0)

        Returns:
            The newly created Task with assigned ID

        Raises:
            ValueError: If title is empty or whitespace-only
        """
        if not title or not title.strip():
            raise ValueError("Task title cannot be empty")

        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description,
            is_complete=False,
            priority=priority,
            category=category,
            tags=tags if tags else [],
            created_at=datetime.now(),
            updated_at=None,
            due_date=due_date,
            recurrence=recurrence,
            reminder_minutes=reminder_minutes
        )
        self._tasks[self._next_id] = task
        self._next_id += 1
        return task

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks in creation order.

        Returns:
            List of all tasks (empty list if none)
        """
        return list(self._tasks.values())

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by its ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            Task if found, None if not found
        """
        return self._tasks.get(task_id)

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[Priority] = None,
        category: Optional[Category] = None,
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        recurrence: Optional[Recurrence] = None,
        reminder_minutes: Optional[int] = None
    ) -> Optional[Task]:
        """Update a task's fields.

        Args:
            task_id: The ID of the task to update
            title: New title (None to keep current)
            description: New description (None to keep current)
            priority: New priority (None to keep current)
            category: New category (None to keep current)
            tags: New tags list (None to keep current)
            due_date: New due date (None to keep current)
            recurrence: New recurrence (None to keep current)
            reminder_minutes: New reminder setting (None to keep current)

        Returns:
            Updated Task if successful, None if task not found

        Raises:
            ValueError: If new title is empty or whitespace-only
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        if title is not None:
            if not title or not title.strip():
                raise ValueError("Task title cannot be empty")
            task.title = title.strip()

        if description is not None:
            task.description = description

        if priority is not None:
            task.priority = priority

        if category is not None:
            task.category = category

        if tags is not None:
            task.tags = tags

        if due_date is not None:
            task.due_date = due_date

        if recurrence is not None:
            task.recurrence = recurrence

        if reminder_minutes is not None:
            task.reminder_minutes = reminder_minutes

        task.updated_at = datetime.now()
        return task

    def delete_task(self, task_id: int) -> Optional[Task]:
        """Delete a task by its ID.

        Args:
            task_id: The ID of the task to delete

        Returns:
            Deleted Task for confirmation, None if not found
        """
        return self._tasks.pop(task_id, None)

    def mark_complete(self, task_id: int) -> Optional[Task]:
        """Mark a task as complete. If recurring, create next occurrence.

        Args:
            task_id: The ID of the task to mark complete

        Returns:
            Updated Task if successful, None if not found
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None

        task.is_complete = True
        task.updated_at = datetime.now()

        # Handle recurring tasks - create next occurrence
        if task.recurrence != Recurrence.NONE:
            self._create_next_occurrence(task)

        return task

    def _create_next_occurrence(self, completed_task: Task) -> Optional[Task]:
        """Create the next occurrence of a recurring task.

        Args:
            completed_task: The completed recurring task

        Returns:
            New Task for next occurrence, or None if not recurring
        """
        next_due = completed_task.get_next_due_date()
        if next_due is None:
            return None

        return self.add_task(
            title=completed_task.title,
            description=completed_task.description,
            priority=completed_task.priority,
            category=completed_task.category,
            tags=completed_task.tags.copy(),
            due_date=next_due,
            recurrence=completed_task.recurrence,
            reminder_minutes=completed_task.reminder_minutes
        )

    def mark_incomplete(self, task_id: int) -> Optional[Task]:
        """Mark a task as incomplete.

        Args:
            task_id: The ID of the task to mark incomplete

        Returns:
            Updated Task if successful, None if not found
        """
        task = self._tasks.get(task_id)
        if task is None:
            return None
        task.is_complete = False
        task.updated_at = datetime.now()
        return task

    # ==================== Search & Filter Methods ====================

    def search_tasks(self, keyword: str) -> List[Task]:
        """Search tasks by keyword in title, description, or tags.

        Args:
            keyword: Search keyword

        Returns:
            List of matching tasks
        """
        if not keyword.strip():
            return self.get_all_tasks()
        return [task for task in self._tasks.values() if task.matches_search(keyword)]

    def filter_by_status(self, completed: Optional[bool] = None) -> List[Task]:
        """Filter tasks by completion status.

        Args:
            completed: True for complete, False for incomplete, None for all

        Returns:
            Filtered list of tasks
        """
        if completed is None:
            return self.get_all_tasks()
        return [task for task in self._tasks.values() if task.is_complete == completed]

    def filter_by_priority(self, priority: Priority) -> List[Task]:
        """Filter tasks by priority level.

        Args:
            priority: Priority level to filter by

        Returns:
            Filtered list of tasks
        """
        return [task for task in self._tasks.values() if task.priority == priority]

    def filter_by_category(self, category: Category) -> List[Task]:
        """Filter tasks by category.

        Args:
            category: Category to filter by

        Returns:
            Filtered list of tasks
        """
        return [task for task in self._tasks.values() if task.category == category]

    def filter_by_tag(self, tag: str) -> List[Task]:
        """Filter tasks by tag.

        Args:
            tag: Tag to filter by

        Returns:
            Filtered list of tasks
        """
        tag_lower = tag.lower()
        return [
            task for task in self._tasks.values()
            if any(t.lower() == tag_lower for t in task.tags)
        ]

    def filter_overdue(self) -> List[Task]:
        """Get all overdue tasks.

        Returns:
            List of overdue tasks
        """
        return [task for task in self._tasks.values() if task.is_overdue()]

    def filter_due_soon(self, within_hours: int = 24) -> List[Task]:
        """Get tasks due within specified hours.

        Args:
            within_hours: Hours threshold (default: 24)

        Returns:
            List of tasks due soon
        """
        return [task for task in self._tasks.values() if task.is_due_soon(within_hours)]

    def filter_by_due_date(self, date: datetime) -> List[Task]:
        """Filter tasks by specific due date (ignoring time).

        Args:
            date: Date to filter by

        Returns:
            List of tasks due on that date
        """
        target_date = date.date()
        return [
            task for task in self._tasks.values()
            if task.due_date and task.due_date.date() == target_date
        ]

    def get_tasks_with_reminders(self) -> List[Task]:
        """Get tasks that should show reminders now.

        Returns:
            List of tasks with active reminders
        """
        return [task for task in self._tasks.values() if task.should_remind()]

    def advanced_filter(
        self,
        keyword: Optional[str] = None,
        status: Optional[bool] = None,
        priority: Optional[Priority] = None,
        category: Optional[Category] = None,
        tag: Optional[str] = None,
        overdue_only: bool = False,
        due_soon_hours: Optional[int] = None
    ) -> List[Task]:
        """Apply multiple filters at once.

        Args:
            keyword: Search keyword
            status: Completion status (True/False/None)
            priority: Priority filter
            category: Category filter
            tag: Tag filter
            overdue_only: Only show overdue tasks
            due_soon_hours: Only show tasks due within hours

        Returns:
            List of tasks matching all criteria
        """
        tasks = list(self._tasks.values())

        if keyword:
            tasks = [t for t in tasks if t.matches_search(keyword)]

        if status is not None:
            tasks = [t for t in tasks if t.is_complete == status]

        if priority is not None:
            tasks = [t for t in tasks if t.priority == priority]

        if category is not None:
            tasks = [t for t in tasks if t.category == category]

        if tag:
            tag_lower = tag.lower()
            tasks = [t for t in tasks if any(tg.lower() == tag_lower for tg in t.tags)]

        if overdue_only:
            tasks = [t for t in tasks if t.is_overdue()]

        if due_soon_hours is not None:
            tasks = [t for t in tasks if t.is_due_soon(due_soon_hours)]

        return tasks

    # ==================== Sort Methods ====================

    def sort_tasks(
        self,
        tasks: Optional[List[Task]] = None,
        sort_by: str = SortOrder.CREATED,
        reverse: bool = False
    ) -> List[Task]:
        """Sort tasks by specified criteria.

        Args:
            tasks: List of tasks to sort (defaults to all tasks)
            sort_by: Sort criteria (due_date, priority, alphabetical, created)
            reverse: Reverse sort order

        Returns:
            Sorted list of tasks
        """
        if tasks is None:
            tasks = self.get_all_tasks()

        if sort_by == SortOrder.DUE_DATE:
            # Tasks without due date go to end
            def due_key(t: Task) -> tuple:
                if t.due_date is None:
                    return (1, datetime.max)
                return (0, t.due_date)
            return sorted(tasks, key=due_key, reverse=reverse)

        elif sort_by == SortOrder.PRIORITY:
            # HIGH = 0 (first), MEDIUM = 1, LOW = 2
            priority_order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
            return sorted(tasks, key=lambda t: priority_order[t.priority], reverse=reverse)

        elif sort_by == SortOrder.ALPHABETICAL:
            return sorted(tasks, key=lambda t: t.title.lower(), reverse=reverse)

        else:  # Default: created
            return sorted(tasks, key=lambda t: t.created_at, reverse=reverse)

    # ==================== Statistics ====================

    def get_statistics(self) -> dict:
        """Get task statistics.

        Returns:
            Dictionary with various statistics
        """
        tasks = self.get_all_tasks()
        total = len(tasks)
        complete = sum(1 for t in tasks if t.is_complete)
        incomplete = total - complete
        overdue = sum(1 for t in tasks if t.is_overdue())

        by_priority = {
            Priority.HIGH: sum(1 for t in tasks if t.priority == Priority.HIGH and not t.is_complete),
            Priority.MEDIUM: sum(1 for t in tasks if t.priority == Priority.MEDIUM and not t.is_complete),
            Priority.LOW: sum(1 for t in tasks if t.priority == Priority.LOW and not t.is_complete),
        }

        by_category = {}
        for cat in Category:
            count = sum(1 for t in tasks if t.category == cat and not t.is_complete)
            if count > 0:
                by_category[cat] = count

        recurring = sum(1 for t in tasks if t.recurrence != Recurrence.NONE and not t.is_complete)

        return {
            "total": total,
            "complete": complete,
            "incomplete": incomplete,
            "overdue": overdue,
            "by_priority": by_priority,
            "by_category": by_category,
            "recurring": recurring,
        }

    def get_all_tags(self) -> List[str]:
        """Get all unique tags across all tasks.

        Returns:
            Sorted list of unique tags
        """
        tags = set()
        for task in self._tasks.values():
            tags.update(task.tags)
        return sorted(tags)
