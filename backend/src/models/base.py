"""
Base model with common timestamp fields.
All domain models inherit from this to get created_at and updated_at automatically.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class TimestampModel(SQLModel):
    """Base model with created_at and updated_at timestamps."""

    created_at: datetime = Field(default_factory=datetime.now, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.now, nullable=False)

    class Config:
        """Pydantic configuration."""

        # Automatically update updated_at on modification (handled at service layer)
        validate_assignment = True
