"""Integration tests for CLI flows - Enhanced Edition.

Reference: specs/002-enhanced-task-features/spec.md
Tests the Rich-based menu flows with new features.
"""

import pytest
from io import StringIO
from unittest.mock import patch, MagicMock
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from services.task_manager import TaskManager
from models.task import Priority, Category, Recurrence


class TestTaskManagerIntegration:
    """Integration tests for TaskManager with new features."""

    def test_add_task_with_all_fields(self) -> None:
        """Test adding a task with all enhanced fields."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        due_date = datetime.now() + timedelta(days=1)
        task = manager.add_task(
            title="Test Task",
            description="Test Description",
            priority=Priority.HIGH,
            category=Category.WORK,
            tags=["urgent", "meeting"],
            due_date=due_date,
            recurrence=Recurrence.WEEKLY,
            reminder_minutes=60,
        )

        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.priority == Priority.HIGH
        assert task.category == Category.WORK
        assert task.tags == ["urgent", "meeting"]
        assert task.due_date == due_date
        assert task.recurrence == Recurrence.WEEKLY
        assert task.reminder_minutes == 60

    def test_recurring_task_creates_next_occurrence(self) -> None:
        """Test that completing a recurring task creates next occurrence."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        due_date = datetime.now() + timedelta(days=1)
        task = manager.add_task(
            title="Daily Standup",
            description="Team meeting",
            priority=Priority.HIGH,
            category=Category.WORK,
            tags=["meeting"],
            due_date=due_date,
            recurrence=Recurrence.DAILY,
            reminder_minutes=15,
        )

        # Mark complete
        manager.mark_complete(task.id)

        # Should now have 2 tasks
        all_tasks = manager.get_all_tasks()
        assert len(all_tasks) == 2

        # Original is complete
        original = manager.get_task(task.id)
        assert original.is_complete is True

        # New task is created
        new_task = manager.get_task(task.id + 1)
        assert new_task is not None
        assert new_task.title == "Daily Standup"
        assert new_task.priority == Priority.HIGH
        assert new_task.category == Category.WORK
        assert new_task.tags == ["meeting"]
        assert new_task.recurrence == Recurrence.DAILY
        assert new_task.is_complete is False


class TestSearchAndFilter:
    """Integration tests for search and filter functionality."""

    def test_search_tasks_by_keyword(self) -> None:
        """Test searching tasks by keyword."""
        manager = TaskManager()
        manager.add_task("Buy groceries", "Weekly shopping", tags=["shopping"])
        manager.add_task("Call doctor", "Schedule appointment", tags=["health"])
        manager.add_task("Shopping list", "Items needed", tags=["shopping"])

        results = manager.search_tasks("shopping")
        # Matches: "Buy groceries" (tag), "Shopping list" (title + tag)
        assert len(results) == 2

        results = manager.search_tasks("doctor")
        assert len(results) == 1
        assert results[0].title == "Call doctor"

    def test_filter_by_priority(self) -> None:
        """Test filtering tasks by priority."""
        manager = TaskManager()
        manager.add_task("High priority", priority=Priority.HIGH)
        manager.add_task("Medium priority", priority=Priority.MEDIUM)
        manager.add_task("Low priority", priority=Priority.LOW)
        manager.add_task("Another high", priority=Priority.HIGH)

        high_tasks = manager.filter_by_priority(Priority.HIGH)
        assert len(high_tasks) == 2

        low_tasks = manager.filter_by_priority(Priority.LOW)
        assert len(low_tasks) == 1

    def test_filter_by_category(self) -> None:
        """Test filtering tasks by category."""
        manager = TaskManager()
        manager.add_task("Work task 1", category=Category.WORK)
        manager.add_task("Home task", category=Category.HOME)
        manager.add_task("Work task 2", category=Category.WORK)

        work_tasks = manager.filter_by_category(Category.WORK)
        assert len(work_tasks) == 2

        home_tasks = manager.filter_by_category(Category.HOME)
        assert len(home_tasks) == 1

    def test_filter_by_tag(self) -> None:
        """Test filtering tasks by tag."""
        manager = TaskManager()
        manager.add_task("Task 1", tags=["urgent", "work"])
        manager.add_task("Task 2", tags=["personal"])
        manager.add_task("Task 3", tags=["urgent", "home"])

        urgent_tasks = manager.filter_by_tag("urgent")
        assert len(urgent_tasks) == 2

        personal_tasks = manager.filter_by_tag("personal")
        assert len(personal_tasks) == 1

    def test_filter_by_status(self) -> None:
        """Test filtering tasks by completion status."""
        manager = TaskManager()
        manager.add_task("Task 1")
        manager.add_task("Task 2")
        manager.add_task("Task 3")
        manager.mark_complete(1)
        manager.mark_complete(2)

        complete = manager.filter_by_status(completed=True)
        assert len(complete) == 2

        incomplete = manager.filter_by_status(completed=False)
        assert len(incomplete) == 1

    def test_filter_overdue(self) -> None:
        """Test filtering overdue tasks."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        # Overdue task
        manager.add_task("Overdue", due_date=datetime.now() - timedelta(hours=1))
        # Future task
        manager.add_task("Future", due_date=datetime.now() + timedelta(days=1))
        # No due date
        manager.add_task("No due date")

        overdue = manager.filter_overdue()
        assert len(overdue) == 1
        assert overdue[0].title == "Overdue"

    def test_filter_due_soon(self) -> None:
        """Test filtering tasks due soon."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        # Due in 12 hours
        manager.add_task("Due soon", due_date=datetime.now() + timedelta(hours=12))
        # Due in 2 days
        manager.add_task("Due later", due_date=datetime.now() + timedelta(days=2))

        due_soon = manager.filter_due_soon(within_hours=24)
        assert len(due_soon) == 1
        assert due_soon[0].title == "Due soon"

    def test_advanced_filter_multiple_criteria(self) -> None:
        """Test advanced filter with multiple criteria."""
        manager = TaskManager()
        manager.add_task("Work High", priority=Priority.HIGH, category=Category.WORK)
        manager.add_task("Work Low", priority=Priority.LOW, category=Category.WORK)
        manager.add_task("Home High", priority=Priority.HIGH, category=Category.HOME)

        results = manager.advanced_filter(
            priority=Priority.HIGH,
            category=Category.WORK,
        )
        assert len(results) == 1
        assert results[0].title == "Work High"


class TestSorting:
    """Integration tests for sorting functionality."""

    def test_sort_by_priority(self) -> None:
        """Test sorting tasks by priority."""
        manager = TaskManager()
        manager.add_task("Low", priority=Priority.LOW)
        manager.add_task("High", priority=Priority.HIGH)
        manager.add_task("Medium", priority=Priority.MEDIUM)

        from services.task_manager import SortOrder
        sorted_tasks = manager.sort_tasks(sort_by=SortOrder.PRIORITY)

        assert sorted_tasks[0].title == "High"
        assert sorted_tasks[1].title == "Medium"
        assert sorted_tasks[2].title == "Low"

    def test_sort_by_due_date(self) -> None:
        """Test sorting tasks by due date."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        manager.add_task("Later", due_date=datetime.now() + timedelta(days=2))
        manager.add_task("Soon", due_date=datetime.now() + timedelta(days=1))
        manager.add_task("No date")  # Should be last

        from services.task_manager import SortOrder
        sorted_tasks = manager.sort_tasks(sort_by=SortOrder.DUE_DATE)

        assert sorted_tasks[0].title == "Soon"
        assert sorted_tasks[1].title == "Later"
        assert sorted_tasks[2].title == "No date"

    def test_sort_alphabetically(self) -> None:
        """Test sorting tasks alphabetically."""
        manager = TaskManager()
        manager.add_task("Zebra")
        manager.add_task("Apple")
        manager.add_task("Mango")

        from services.task_manager import SortOrder
        sorted_tasks = manager.sort_tasks(sort_by=SortOrder.ALPHABETICAL)

        assert sorted_tasks[0].title == "Apple"
        assert sorted_tasks[1].title == "Mango"
        assert sorted_tasks[2].title == "Zebra"


class TestStatistics:
    """Integration tests for statistics functionality."""

    def test_get_statistics(self) -> None:
        """Test getting task statistics."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        manager.add_task("High Work", priority=Priority.HIGH, category=Category.WORK)
        manager.add_task("Medium Home", priority=Priority.MEDIUM, category=Category.HOME)
        manager.add_task("Overdue", due_date=datetime.now() - timedelta(hours=1))
        manager.add_task("Recurring", recurrence=Recurrence.DAILY,
                        due_date=datetime.now() + timedelta(days=1))
        manager.mark_complete(1)

        stats = manager.get_statistics()

        assert stats['total'] == 4
        assert stats['complete'] == 1
        assert stats['incomplete'] == 3
        assert stats['overdue'] == 1
        assert stats['recurring'] == 1

    def test_get_all_tags(self) -> None:
        """Test getting all unique tags."""
        manager = TaskManager()
        manager.add_task("Task 1", tags=["work", "urgent"])
        manager.add_task("Task 2", tags=["personal", "urgent"])
        manager.add_task("Task 3", tags=["work"])

        all_tags = manager.get_all_tags()

        assert "work" in all_tags
        assert "urgent" in all_tags
        assert "personal" in all_tags
        assert len(all_tags) == 3  # unique tags


class TestReminders:
    """Integration tests for reminder functionality."""

    def test_should_remind(self) -> None:
        """Test that tasks with reminders trigger correctly."""
        manager = TaskManager()
        from datetime import datetime, timedelta

        # Task due in 10 minutes with 15 min reminder
        manager.add_task(
            "Soon task",
            due_date=datetime.now() + timedelta(minutes=10),
            reminder_minutes=15,
        )

        # Task due in 2 hours with 15 min reminder (should not trigger)
        manager.add_task(
            "Later task",
            due_date=datetime.now() + timedelta(hours=2),
            reminder_minutes=15,
        )

        reminders = manager.get_tasks_with_reminders()
        assert len(reminders) == 1
        assert reminders[0].title == "Soon task"


class TestBackwardCompatibility:
    """Tests for backward compatibility with existing tasks."""

    def test_default_priority_is_medium(self) -> None:
        """Test that tasks default to Medium priority."""
        manager = TaskManager()
        task = manager.add_task("Test")
        assert task.priority == Priority.MEDIUM

    def test_default_category_is_other(self) -> None:
        """Test that tasks default to Other category."""
        manager = TaskManager()
        task = manager.add_task("Test")
        assert task.category == Category.OTHER

    def test_default_tags_is_empty(self) -> None:
        """Test that tasks default to empty tags."""
        manager = TaskManager()
        task = manager.add_task("Test")
        assert task.tags == []

    def test_default_recurrence_is_none(self) -> None:
        """Test that tasks default to no recurrence."""
        manager = TaskManager()
        task = manager.add_task("Test")
        assert task.recurrence == Recurrence.NONE
