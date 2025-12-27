"""Unit tests for Task model.

Reference: plan.md § Testing Strategy
"""

import pytest
from datetime import datetime, timedelta

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from models.task import Task, Priority


class TestTaskCreation:
    """Test Task dataclass creation."""

    def test_create_task_with_all_fields(self) -> None:
        """Test creating a task with all fields explicitly set."""
        created_time = datetime.now()
        updated_time = datetime.now()
        due_date = datetime.now() + timedelta(days=7)
        task = Task(
            id=1,
            title="Test Task",
            description="Test Description",
            is_complete=True,
            priority=Priority.HIGH,
            created_at=created_time,
            updated_at=updated_time,
            due_date=due_date
        )

        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.is_complete is True
        assert task.priority == Priority.HIGH
        assert task.created_at == created_time
        assert task.updated_at == updated_time
        assert task.due_date == due_date

    def test_create_task_with_defaults(self) -> None:
        """Test creating a task with default values."""
        task = Task(id=1, title="Test Task")

        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == ""
        assert task.is_complete is False
        assert task.priority == Priority.MEDIUM
        assert task.updated_at is None
        assert task.due_date is None

    def test_created_at_is_datetime_type(self) -> None:
        """Test that created_at field is datetime type."""
        task = Task(id=1, title="Test Task")

        assert isinstance(task.created_at, datetime)

    def test_created_at_default_is_current_time(self) -> None:
        """Test that created_at defaults to approximately current time."""
        before = datetime.now()
        task = Task(id=1, title="Test Task")
        after = datetime.now()

        assert before <= task.created_at <= after


class TestTaskPriority:
    """Test Task priority functionality."""

    def test_priority_enum_values(self) -> None:
        """Test priority enum has expected values."""
        assert Priority.LOW.value == "low"
        assert Priority.MEDIUM.value == "medium"
        assert Priority.HIGH.value == "high"

    def test_task_with_high_priority(self) -> None:
        """Test creating task with high priority."""
        task = Task(id=1, title="Urgent Task", priority=Priority.HIGH)
        assert task.priority == Priority.HIGH

    def test_task_with_low_priority(self) -> None:
        """Test creating task with low priority."""
        task = Task(id=1, title="Low Priority Task", priority=Priority.LOW)
        assert task.priority == Priority.LOW


class TestTaskOverdue:
    """Test Task overdue functionality."""

    def test_task_not_overdue_when_no_due_date(self) -> None:
        """Test task is not overdue when no due date set."""
        task = Task(id=1, title="No Due Date")
        assert task.is_overdue() is False

    def test_task_not_overdue_when_complete(self) -> None:
        """Test completed task is not overdue even if past due date."""
        past_date = datetime.now() - timedelta(days=1)
        task = Task(id=1, title="Complete Task", due_date=past_date, is_complete=True)
        assert task.is_overdue() is False

    def test_task_overdue_when_past_due_date(self) -> None:
        """Test task is overdue when past due date and incomplete."""
        past_date = datetime.now() - timedelta(days=1)
        task = Task(id=1, title="Overdue Task", due_date=past_date, is_complete=False)
        assert task.is_overdue() is True

    def test_task_not_overdue_when_future_due_date(self) -> None:
        """Test task is not overdue when due date is in future."""
        future_date = datetime.now() + timedelta(days=7)
        task = Task(id=1, title="Future Task", due_date=future_date)
        assert task.is_overdue() is False
