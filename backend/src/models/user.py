"""
User domain model.
Represents a registered user account with authentication credentials.
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class User(SQLModel, table=True):
    """
    User entity for authentication and todo ownership.

    Attributes:
        id: Auto-generated primary key
        email: Unique email address (login identifier)
        password_hash: Bcrypt-hashed password (never stored in plain text)
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

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
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(SQLModel):
    """User creation request model."""

    email: str = Field(max_length=255)
    password: str = Field(min_length=8)
