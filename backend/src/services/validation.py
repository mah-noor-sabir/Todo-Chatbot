"""
Input validation utilities.
Provides reusable validation functions for email, password, and todo fields.
"""

import re
from src.core.exceptions import ValidationError

# RFC 5322 simplified email regex
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def validate_email_format(email: str) -> None:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Raises:
        ValidationError: If email format is invalid
    """
    if not email or not email.strip():
        raise ValidationError("Email is required", field="email")

    if not EMAIL_REGEX.match(email):
        raise ValidationError("Invalid email format", field="email")


def validate_password_strength(password: str) -> None:
    """
    Validate password meets minimum security requirements.
    Spec requirement: minimum 8 characters (FR-003)

    Args:
        password: Password to validate

    Raises:
        ValidationError: If password doesn't meet requirements
    """
    if not password:
        raise ValidationError("Password is required", field="password")

    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters", field="password")


def validate_todo_title(title: str) -> str:
    """
    Validate todo title.
    Spec requirements: required, max 200 chars, not whitespace-only (FR-017, FR-018)

    Args:
        title: Title to validate

    Returns:
        Stripped title

    Raises:
        ValidationError: If title is invalid
    """
    if not title:
        raise ValidationError("Title is required", field="title")

    title = title.strip()

    if not title:
        raise ValidationError("Title cannot be empty", field="title")

    if len(title) > 200:
        raise ValidationError("Title too long (max 200 characters)", field="title")

    return title


def validate_todo_description(description: str | None) -> str | None:
    """
    Validate todo description.
    Spec requirement: optional, max 1000 chars (FR-019)

    Args:
        description: Description to validate (can be None)

    Returns:
        Description or None

    Raises:
        ValidationError: If description exceeds max length
    """
    if description is None:
        return None

    if len(description) > 1000:
        raise ValidationError("Description too long (max 1000 characters)", field="description")

    return description.strip() if description.strip() else None
