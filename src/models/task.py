"""Task model for Todo Console Application.

Enhanced with categories, tags, recurrence, and due date with time support.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, List


class Priority(Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Category(Enum):
    """Task categories for organization."""
    WORK = "work"
    HOME = "home"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    OTHER = "other"


class Recurrence(Enum):
    """Task recurrence patterns."""
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique numeric identifier (auto-assigned, never reused)
        title: Short description of what needs to be done (required, non-empty)
        description: Optional longer explanation or details
        is_complete: Boolean flag indicating completion status
        priority: Task priority level (LOW, MEDIUM, HIGH)
        category: Task category (WORK, HOME, PERSONAL, etc.)
        tags: List of custom tags for flexible organization
        created_at: Timestamp when the task was created
        updated_at: Timestamp when the task was last updated
        due_date: Optional deadline for the task (includes time)
        recurrence: Recurrence pattern (NONE, DAILY, WEEKLY, MONTHLY)
        reminder_minutes: Minutes before due date to show reminder (0 = no reminder)
    """
    id: int
    title: str
    description: str = ""
    is_complete: bool = False
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    recurrence: Recurrence = Recurrence.NONE
    reminder_minutes: int = 0

    def is_overdue(self) -> bool:
        """Check if task is overdue (past due date and not complete)."""
        if self.due_date is None or self.is_complete:
            return False
        return datetime.now() > self.due_date

    def is_due_soon(self, within_hours: int = 24) -> bool:
        """Check if task is due within specified hours."""
        if self.due_date is None or self.is_complete:
            return False
        time_until_due = self.due_date - datetime.now()
        return timedelta(0) < time_until_due <= timedelta(hours=within_hours)

    def should_remind(self) -> bool:
        """Check if reminder should be shown now."""
        if self.due_date is None or self.is_complete or self.reminder_minutes <= 0:
            return False
        time_until_due = self.due_date - datetime.now()
        reminder_threshold = timedelta(minutes=self.reminder_minutes)
        return timedelta(0) < time_until_due <= reminder_threshold

    def get_next_due_date(self) -> Optional[datetime]:
        """Calculate next due date based on recurrence pattern."""
        if self.due_date is None or self.recurrence == Recurrence.NONE:
            return None

        if self.recurrence == Recurrence.DAILY:
            return self.due_date + timedelta(days=1)
        elif self.recurrence == Recurrence.WEEKLY:
            return self.due_date + timedelta(weeks=1)
        elif self.recurrence == Recurrence.MONTHLY:
            # Add approximately one month (30 days)
            next_month = self.due_date.month + 1
            next_year = self.due_date.year
            if next_month > 12:
                next_month = 1
                next_year += 1
            # Handle day overflow (e.g., Jan 31 -> Feb 28)
            day = min(self.due_date.day, 28)  # Safe for all months
            return self.due_date.replace(year=next_year, month=next_month, day=day)
        return None

    def matches_search(self, keyword: str) -> bool:
        """Check if task matches a search keyword."""
        keyword_lower = keyword.lower()
        return (
            keyword_lower in self.title.lower() or
            keyword_lower in self.description.lower() or
            any(keyword_lower in tag.lower() for tag in self.tags)
        )
