"""
Database session middleware.
Ensures database session remains open for the entire request lifecycle
to prevent DetachedInstanceError when serializing ORM objects.
"""

from typing import Callable, Awaitable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import AsyncSessionLocal


class DBSessionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to manage database sessions for the entire request lifecycle.
    Prevents DetachedInstanceError by keeping the session open until
    the response is fully processed.
    """
    
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        # Create a new database session for this request
        async with AsyncSessionLocal() as session:
            # Attach the session to the request state
            request.state.db = session
            
            try:
                # Process the request
                response = await call_next(request)
            except Exception:
                # Rollback on exception
                await session.rollback()
                raise
            else:
                # Commit on success
                await session.commit()
            
            return response


# Alternative dependency that uses the session from request state
async def get_db_session_from_state(request: Request) -> AsyncSession:
    """
    Dependency that retrieves the database session from request state.
    Used with DBSessionMiddleware to share the same session for the entire request.
    """
    return request.state.db