"""Unit tests for TaskManager service.

Reference: plan.md § Testing Strategy, spec.md § Acceptance Scenarios
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from services.task_manager import TaskManager


class TestAddTask:
    """Test TaskManager.add_task() method."""

    def test_add_task_with_title_only(self) -> None:
        """Test adding a task with only title."""
        manager = TaskManager()
        task = manager.add_task("Buy groceries")

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == ""
        assert task.is_complete is False

    def test_add_task_with_title_and_description(self) -> None:
        """Test adding a task with title and description."""
        manager = TaskManager()
        task = manager.add_task("Buy groceries", "Weekly shopping list")

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == "Weekly shopping list"

    def test_add_task_rejects_empty_title(self) -> None:
        """Test that empty title raises ValueError."""
        manager = TaskManager()

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            manager.add_task("")

    def test_add_task_rejects_whitespace_only_title(self) -> None:
        """Test that whitespace-only title raises ValueError."""
        manager = TaskManager()

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            manager.add_task("   ")

    def test_add_task_strips_title_whitespace(self) -> None:
        """Test that title whitespace is stripped."""
        manager = TaskManager()
        task = manager.add_task("  Buy groceries  ")

        assert task.title == "Buy groceries"

    def test_add_multiple_tasks_increments_id(self) -> None:
        """Test that IDs auto-increment."""
        manager = TaskManager()
        task1 = manager.add_task("Task 1")
        task2 = manager.add_task("Task 2")
        task3 = manager.add_task("Task 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3


class TestGetAllTasks:
    """Test TaskManager.get_all_tasks() method."""

    def test_get_all_tasks_returns_empty_list_initially(self) -> None:
        """Test that empty manager returns empty list."""
        manager = TaskManager()

        assert manager.get_all_tasks() == []

    def test_get_all_tasks_returns_tasks_in_order(self) -> None:
        """Test that tasks are returned in creation order."""
        manager = TaskManager()
        manager.add_task("Task A")
        manager.add_task("Task B")
        manager.add_task("Task C")

        tasks = manager.get_all_tasks()

        assert len(tasks) == 3
        assert tasks[0].title == "Task A"
        assert tasks[1].title == "Task B"
        assert tasks[2].title == "Task C"


class TestGetTask:
    """Test TaskManager.get_task() method."""

    def test_get_task_returns_task_by_id(self) -> None:
        """Test getting a task by valid ID."""
        manager = TaskManager()
        manager.add_task("Task 1")
        task2 = manager.add_task("Task 2")

        result = manager.get_task(2)

        assert result is not None
        assert result.id == task2.id
        assert result.title == "Task 2"

    def test_get_task_returns_none_for_invalid_id(self) -> None:
        """Test that invalid ID returns None."""
        manager = TaskManager()
        manager.add_task("Task 1")

        assert manager.get_task(999) is None


class TestUpdateTask:
    """Test TaskManager.update_task() method."""

    def test_update_task_updates_title(self) -> None:
        """Test updating task title."""
        manager = TaskManager()
        manager.add_task("Old Title")

        result = manager.update_task(1, title="New Title")

        assert result is not None
        assert result.title == "New Title"

    def test_update_task_updates_description(self) -> None:
        """Test updating task description."""
        manager = TaskManager()
        manager.add_task("Task", "Old Description")

        result = manager.update_task(1, description="New Description")

        assert result is not None
        assert result.description == "New Description"

    def test_update_task_preserves_unchanged_fields(self) -> None:
        """Test that None parameters preserve existing values."""
        manager = TaskManager()
        manager.add_task("Original Title", "Original Description")

        # Update only title
        manager.update_task(1, title="New Title")
        task = manager.get_task(1)
        assert task is not None
        assert task.title == "New Title"
        assert task.description == "Original Description"

        # Update only description
        manager.update_task(1, description="New Description")
        task = manager.get_task(1)
        assert task is not None
        assert task.title == "New Title"
        assert task.description == "New Description"

    def test_update_task_rejects_empty_title(self) -> None:
        """Test that empty title raises ValueError."""
        manager = TaskManager()
        manager.add_task("Task")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            manager.update_task(1, title="")

    def test_update_task_rejects_whitespace_title(self) -> None:
        """Test that whitespace-only title raises ValueError."""
        manager = TaskManager()
        manager.add_task("Task")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            manager.update_task(1, title="   ")

    def test_update_task_returns_none_for_invalid_id(self) -> None:
        """Test that invalid ID returns None."""
        manager = TaskManager()

        assert manager.update_task(999, title="New Title") is None


class TestDeleteTask:
    """Test TaskManager.delete_task() method."""

    def test_delete_task_removes_task(self) -> None:
        """Test that delete removes task from storage."""
        manager = TaskManager()
        manager.add_task("Task to delete")

        deleted = manager.delete_task(1)

        assert deleted is not None
        assert deleted.title == "Task to delete"
        assert manager.get_task(1) is None

    def test_delete_task_returns_none_for_invalid_id(self) -> None:
        """Test that invalid ID returns None."""
        manager = TaskManager()

        assert manager.delete_task(999) is None


class TestMarkComplete:
    """Test TaskManager.mark_complete() method."""

    def test_mark_complete_sets_is_complete_true(self) -> None:
        """Test that mark_complete sets is_complete to True."""
        manager = TaskManager()
        manager.add_task("Task")

        result = manager.mark_complete(1)

        assert result is not None
        assert result.is_complete is True

    def test_mark_complete_returns_none_for_invalid_id(self) -> None:
        """Test that invalid ID returns None."""
        manager = TaskManager()

        assert manager.mark_complete(999) is None

    def test_mark_complete_is_idempotent(self) -> None:
        """Test that marking already-complete task is valid."""
        manager = TaskManager()
        manager.add_task("Task")
        manager.mark_complete(1)

        # Mark complete again - should not error
        result = manager.mark_complete(1)

        assert result is not None
        assert result.is_complete is True


class TestMarkIncomplete:
    """Test TaskManager.mark_incomplete() method."""

    def test_mark_incomplete_sets_is_complete_false(self) -> None:
        """Test that mark_incomplete sets is_complete to False."""
        manager = TaskManager()
        manager.add_task("Task")
        manager.mark_complete(1)  # First make it complete

        result = manager.mark_incomplete(1)

        assert result is not None
        assert result.is_complete is False

    def test_mark_incomplete_returns_none_for_invalid_id(self) -> None:
        """Test that invalid ID returns None."""
        manager = TaskManager()

        assert manager.mark_incomplete(999) is None

    def test_mark_incomplete_is_idempotent(self) -> None:
        """Test that marking already-incomplete task is valid."""
        manager = TaskManager()
        manager.add_task("Task")  # Starts incomplete

        # Mark incomplete again - should not error
        result = manager.mark_incomplete(1)

        assert result is not None
        assert result.is_complete is False


class TestIdNeverReused:
    """Test that IDs are never reused after deletion."""

    def test_ids_never_reused_after_delete(self) -> None:
        """Test that deleted IDs are not reused."""
        manager = TaskManager()
        manager.add_task("Task 1")  # ID 1
        manager.add_task("Task 2")  # ID 2
        manager.delete_task(1)  # Delete ID 1

        # Next task should be ID 3, not ID 1
        task3 = manager.add_task("Task 3")

        assert task3.id == 3
        assert manager.get_task(1) is None
