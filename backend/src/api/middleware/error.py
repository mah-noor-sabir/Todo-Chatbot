"""
Error handling middleware.
Converts custom exceptions to consistent JSON error responses.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from src.core.exceptions import (
    AuthenticationError,
    ValidationError,
    NotFoundError,
    ForbiddenError,
)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers with the FastAPI app."""

    @app.exception_handler(AuthenticationError)
    async def authentication_exception_handler(request: Request, exc: AuthenticationError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "code": "AUTHENTICATION_ERROR",
                    "message": exc.message,
                }
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        error_content = {
            "code": "VALIDATION_ERROR",
            "message": exc.message,
        }
        if exc.field:
            error_content["field"] = exc.field

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": error_content},
        )

    @app.exception_handler(NotFoundError)
    async def not_found_exception_handler(request: Request, exc: NotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "code": "NOT_FOUND",
                    "message": exc.message,
                }
            },
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_exception_handler(request: Request, exc: ForbiddenError):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": {
                    "code": "AUTHORIZATION_ERROR",
                    "message": exc.message,
                }
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Catch-all for unexpected errors. Log details but return generic message."""
        # TODO: Add structured logging here
        import traceback
        import sys
        error_msg = f"ERROR: {exc}\nTRACEBACK: {traceback.format_exc()}"
        print(error_msg, file=sys.stderr, flush=True)
        with open("error_log.txt", "a") as f:
            f.write(f"\n\n{error_msg}\n\n")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred. Please try again.",
                }
            },
        )
