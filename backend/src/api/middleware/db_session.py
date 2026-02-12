"""
Database session middleware.
Ensures database session remains open for the entire request lifecycle
to prevent DetachedInstanceError when serializing ORM objects.
"""

from typing import Callable, Awaitable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import InvalidRequestError, PendingRollbackError

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

                # Commit the session if it's in a valid state
                try:
                    if session.in_transaction():
                        await session.commit()
                except PendingRollbackError:
                    # If there's a pending rollback, explicitly rollback first
                    await session.rollback()
                    # Then try to commit again if needed
                    if session.in_transaction():
                        await session.commit()
                except InvalidRequestError:
                    # Session is already in a bad state, likely due to a previous error
                    # The error has already been handled, so we just continue
                    pass
            except Exception:
                # Rollback on exception
                try:
                    await session.rollback()
                except:
                    # If rollback fails, we continue to raise the original exception
                    pass
                raise

            return response


# Alternative dependency that uses the session from request state
async def get_db_session_from_state(request: Request) -> AsyncSession:
    """
    Dependency that retrieves the database session from request state.
    Used with DBSessionMiddleware to share the same session for the entire request.
    """
    return request.state.db