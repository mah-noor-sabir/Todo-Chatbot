"""
User domain model.
Represents a registered user account with authentication credentials.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from src.models.conversation import Conversation
    from src.models.message import Message


class User(SQLModel, table=True):
    """
    User entity for authentication and todo ownership.

    Attributes:
        id: Auto-generated primary key
        first_name: User's first name
        last_name: User's last name
        email: Unique email address (login identifier)
        password_hash: Bcrypt-hashed password (never stored in plain text)
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str = Field(max_length=50, nullable=False)
    last_name: Optional[str] = Field(default=None, max_length=50, nullable=True)
    email: str = Field(unique=True, index=True, max_length=255, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=False)

    conversations: List["Conversation"] = Relationship(back_populates="user")
    messages: List["Message"] = Relationship(back_populates="user")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
            }
        },
        "from_attributes": True,
    }


class UserResponse(SQLModel):
    """User response model (excludes password_hash for security)."""

    id: int
    first_name: str
    last_name: Optional[str]
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(SQLModel):
    """User creation request model."""

    first_name: str = Field(min_length=2, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8)


class UserLogin(SQLModel):
    """User login request model."""

    email: str = Field(max_length=255)
    password: str = Field(min_length=1)
