"""
Authentication API routes.
Handles user signup, signin, signout, and session management.
"""

from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from jose import jwt, JWTError

from src.core.database import get_session as get_db_session
from src.models.user import UserCreate, UserResponse
from src.services.auth_service import AuthService
from src.core.config import settings
from src.core.exceptions import AuthenticationError, ValidationError

router = APIRouter()

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(user_id: int) -> str:
    """Create JWT access token for user session."""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> int:
    """Verify JWT token and return user ID."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token")
        return int(user_id)
    except JWTError:
        raise AuthenticationError("Invalid or expired token")


@router.post("/auth/signup", response_model=UserResponse, status_code=201)
async def signup(
    user_data: UserCreate,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Register new user account and set session cookie.

    Request Body:
        - email: User's email (unique)
        - password: Password (min 8 characters)

    Returns:
        UserResponse: Created user data (excludes password_hash)

    Errors:
        - 400: Validation error (invalid email, password too short)
        - 409: Email already registered
        - 500: Server error
    """
    try:
        auth_service = AuthService(session)
        user = await auth_service.register_user(user_data)
        token = create_access_token(user.id)
    except Exception as e:
        print(f"SIGNUP ERROR: {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise

    # Set session cookie - LOCALHOST DEVELOPMENT SETTINGS
    # For localhost HTTP, use: secure=False, samesite="lax"
    # samesite="none" REQUIRES secure=True (HTTPS), which doesn't work on localhost HTTP
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=False,  # False for localhost HTTP, True for production HTTPS
        samesite="lax",  # "lax" works for localhost, "none" requires HTTPS
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600,  # 24 hours in seconds
        path="/",  # Cookie available for all paths
        domain=None,  # Let browser set domain (localhost)
    )

    return UserResponse(id=user.id, email=user.email, created_at=user.created_at)


@router.post("/auth/signin", response_model=UserResponse)
async def signin(
    credentials: UserCreate,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Authenticate user and set session cookie.

    Request Body:
        - email: User's email
        - password: User's password

    Returns:
        UserResponse: Authenticated user data

    Errors:
        - 400: Missing fields
        - 401: Invalid email or password
        - 500: Server error
    """
    if not credentials.email or not credentials.password:
        raise ValidationError("Email and password are required")

    auth_service = AuthService(session)
    user = await auth_service.authenticate_user(credentials.email, credentials.password)
    token = create_access_token(user.id)

    # Set session cookie - LOCALHOST DEVELOPMENT SETTINGS
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,  # False for localhost HTTP
        samesite="lax",  # Works for localhost same-origin requests
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        path="/",
        domain=None,
    )

    return UserResponse(id=user.id, email=user.email, created_at=user.created_at)


@router.post("/auth/signout", status_code=204)
async def signout(response: Response):
    """
    Clear session cookie.

    Returns:
        204 No Content

    Errors:
        - 500: Server error
    """
    # Clear session cookie - must match the original cookie settings
    response.delete_cookie(
        key="session",
        path="/",
        domain=None,
        samesite="lax",  # Must match original cookie
    )
    return None


@router.get("/auth/session", response_model=UserResponse)
async def get_session(
    request: Request,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Verify current session and return user data.

    Returns:
        UserResponse: Current user data

    Errors:
        - 401: Session invalid or expired
        - 500: Server error
    """
    token = request.cookies.get("session")
    if not token:
        raise AuthenticationError("Authentication required")

    user_id = verify_access_token(token)
    auth_service = AuthService(session)
    user = await auth_service.get_user_by_id(user_id)

    return UserResponse(id=user.id, email=user.email, created_at=user.created_at)
