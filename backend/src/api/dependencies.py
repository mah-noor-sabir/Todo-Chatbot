"""
FastAPI dependencies for dependency injection.
Provides reusable dependencies for routes.
"""

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session
from src.models.user import User
from src.api.middleware.auth import get_current_user

# Re-export for convenience
__all__ = ["get_session", "get_current_user"]
