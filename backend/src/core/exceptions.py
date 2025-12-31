"""
Custom exception classes for domain errors.
Used for consistent error handling across the application.
"""


class AuthenticationError(Exception):
    """Raised when authentication fails (invalid credentials, missing session)."""

    def __init__(self, message: str = "Authentication failed"):
        self.message = message
        super().__init__(self.message)


class ValidationError(Exception):
    """Raised when input validation fails."""

    def __init__(self, message: str, field: str | None = None):
        self.message = message
        self.field = field
        super().__init__(self.message)


class NotFoundError(Exception):
    """Raised when a requested resource doesn't exist."""

    def __init__(self, message: str = "Resource not found"):
        self.message = message
        super().__init__(self.message)


class ForbiddenError(Exception):
    """Raised when user lacks permission to access/modify a resource."""

    def __init__(self, message: str = "You don't have permission to access this resource"):
        self.message = message
        super().__init__(self.message)
