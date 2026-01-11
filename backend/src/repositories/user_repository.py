"""
User repository for data access.
Handles all database operations for User entity.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from src.models.user import User


class UserRepository:
    """Repository for User entity data access."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(
        self,
        first_name: str,
        last_name: str,
        email: str,
        password_hash: str
    ) -> User:
        """
        Create a new user account.

        Args:
            first_name: User's first name
            last_name: User's last name
            email: User's email address (must be unique)
            password_hash: Bcrypt-hashed password

        Returns:
            Created User entity

        Raises:
            IntegrityError: If email already exists
        """
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=password_hash
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Find user by email address.

        Args:
            email: Email to search for

        Returns:
            User if found, None otherwise
        """
        statement = select(User).where(User.email == email)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Find user by ID.

        Args:
            user_id: User ID to search for

        Returns:
            User if found, None otherwise
        """
        statement = select(User).where(User.id == user_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
