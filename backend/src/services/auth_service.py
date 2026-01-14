"""
Authentication service.
Business logic for user registration, authentication, and session management.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from src.models.user import User, UserCreate, UserResponse
from src.repositories.user_repository import UserRepository
from src.core.security import hash_password, verify_password
from src.core.exceptions import AuthenticationError, ValidationError
from src.services.validation import validate_email_format, validate_password_strength
from src.core.cache import cache


class AuthService:
    """Service layer for authentication operations."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register_user(self, user_data: UserCreate) -> User:
        """
        Register a new user account.
        Validates email format, password strength, hashes password, creates user.

        Args:
            user_data: User creation request (email, password)

        Returns:
            Created User entity

        Raises:
            ValidationError: If email/password invalid
            ValidationError: If email already registered (code: CONFLICT)
        """
        # Validate inputs
        validate_email_format(user_data.email)
        validate_password_strength(user_data.password)

        # Hash password
        password_hash = hash_password(user_data.password)

        # Create user
        try:
            user = await self.user_repo.create_user(
                first_name=user_data.first_name.strip(),
                last_name=user_data.last_name.strip(),
                email=user_data.email.strip().lower(),  # Normalize email
                password_hash=password_hash,
            )

            # Cache the new user
            cache_key = f"user:email:{user_data.email.strip().lower()}"
            cache.set(cache_key, user, ttl_seconds=300)

            return user
        except IntegrityError:
            # Email already exists (unique constraint violation)
            raise ValidationError("Email already registered", field="email")

    async def authenticate_user(self, email: str, password: str) -> User:
        """
        Authenticate user with email and password.

        Args:
            email: User's email
            password: Plain-text password

        Returns:
            User entity if authentication succeeds

        Raises:
            AuthenticationError: If credentials are invalid
        """
        normalized_email = email.strip().lower()

        # Try to get from cache first
        cache_key = f"user:email:{normalized_email}"
        user = cache.get(cache_key)

        if user is None:
            # Find user by email
            user = await self.user_repo.get_user_by_email(normalized_email)

            if not user:
                # User not found - return generic error (don't reveal if email exists)
                raise AuthenticationError("Invalid email or password")

            # Cache user for 5 minutes
            cache.set(cache_key, user, ttl_seconds=300)
        else:
            # User retrieved from cache
            if not verify_password(password, user.password_hash):
                raise AuthenticationError("Invalid email or password")

            return user

        # Verify password
        if not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        return user

    async def get_user_by_id(self, user_id: int) -> User:
        """
        Get user by ID (for session validation).

        Args:
            user_id: User ID

        Returns:
            User entity

        Raises:
            AuthenticationError: If user not found
        """
        # Try to get from cache first
        cache_key = f"user:{user_id}"
        user = cache.get(cache_key)

        if user is None:
            user = await self.user_repo.get_user_by_id(user_id)

            if not user:
                raise AuthenticationError("User not found")

            # Cache user for 5 minutes
            cache.set(cache_key, user, ttl_seconds=300)
        elif not user:
            raise AuthenticationError("User not found")

        return user
