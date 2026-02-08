"""
Authentication middleware.
Validates session tokens and injects current user into request context.
"""

from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.middleware.db_session import get_db_session_from_state as get_session
from src.core.exceptions import AuthenticationError
from src.models.user import User
from src.services.auth_service import AuthService
from jose import jwt, JWTError
from src.core.config import settings

ALGORITHM = "HS256"


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    """
    FastAPI dependency for getting the current authenticated user.
    Validates session cookie and returns User entity.

    Usage:
        @router.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            # current_user is guaranteed to be authenticated

    Args:
        request: FastAPI request object (contains cookies)
        session: Database session

    Returns:
        User: Authenticated user entity

    Raises:
        AuthenticationError: If session is invalid, expired, or missing
    """
    # Get session cookie
    token = request.cookies.get("session")

    if not token:
        raise AuthenticationError("Authentication required")

    # Verify token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token")
        user_id = int(user_id)
    except JWTError:
        raise AuthenticationError("Invalid or expired token")

    # Get user from database
    auth_service = AuthService(session)
    user = await auth_service.get_user_by_id(user_id)

    # Return the user object - the session will remain open until the response is serialized
    # The UserResponse model should handle the conversion properly
    return user
