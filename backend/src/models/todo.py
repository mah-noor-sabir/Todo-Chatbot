"""
Todo domain model.
Represents a task item with title, description, priority, tags, and completion status.
"""

from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    """Priority levels for todos."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RecurrencePattern(str, Enum):
    """Recurrence patterns for todos."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Todo(SQLModel, table=True):
    """
    Todo entity scoped to a user.

    Attributes:
        id: Auto-generated primary key
        user_id: Foreign key to users table (owner)
        title: Task title (max 200 chars, required)
        description: Task description (max 1000 chars, optional)
        is_completed: Completion status (default: false)
        priority: Task priority (high/medium/low, default: medium)
        tags: List of tags for categorization
        due_date: Optional due date and time
        recurrence: Optional recurrence pattern
        created_at: Creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(min_length=1, max_length=200, nullable=False, index=True)
    description: Optional[str] = Field(default=None, max_length=1000, index=True)
    is_completed: bool = Field(default=False, nullable=False, index=True)
    priority: str = Field(default="medium", nullable=False, index=True)
    tags: str = Field(default="[]", nullable=False, index=True)  # Stored as JSON string
    due_date: Optional[datetime] = Field(default=None, index=True)
    recurrence: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False, index=True)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=False, index=True)

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "is_completed": False,
                "priority": "high",
                "tags": ["shopping", "home"],
                "due_date": "2025-01-15T10:00:00Z",
                "recurrence": "weekly"
            }
        },
        "from_attributes": True,
    }


class TodoResponse(SQLModel):
    """Todo response model with all fields."""

    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_completed: bool
    priority: str
    tags: List[str]
    due_date: Optional[datetime]
    recurrence: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, obj: Todo) -> "TodoResponse":
        """Convert Todo ORM model to response with parsed tags."""
        import json
        tags = json.loads(obj.tags) if obj.tags else []
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            title=obj.title,
            description=obj.description,
            is_completed=obj.is_completed,
            priority=obj.priority,
            tags=tags,
            due_date=obj.due_date,
            recurrence=obj.recurrence,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


class TodoCreate(SQLModel):
    """Todo creation request model."""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium")
    tags: Optional[List[str]] = Field(default=[])
    due_date: Optional[datetime] = Field(default=None)
    recurrence: Optional[str] = Field(default=None)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "priority": "high",
                "tags": ["shopping", "home"],
                "due_date": "2025-01-15T10:00:00Z",
                "recurrence": "weekly"
            }
        }
    }


class TodoUpdate(SQLModel):
    """Todo update request model."""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium")
    tags: Optional[List[str]] = Field(default=[])
    due_date: Optional[datetime] = Field(default=None)
    recurrence: Optional[str] = Field(default=None)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Updated title",
                "description": "Updated description",
                "priority": "low",
                "tags": ["new-tag"],
                "due_date": "2025-01-20T14:00:00Z",
                "recurrence": None
            }
        }
    }


class TodoToggle(SQLModel):
    """Todo completion toggle request model."""

    is_completed: bool
