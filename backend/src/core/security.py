"""
Security utilities for password hashing and verification.
Uses bcrypt for secure password hashing with SHA-256 pre-hashing to handle long passwords.
"""

import hashlib
from passlib.context import CryptContext

# Bcrypt context with cost factor 12
# Using SHA-256 pre-hashing to handle passwords longer than 72 bytes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _prehash_password(password: str) -> str:
    """
    Pre-hash password with SHA-256 to handle bcrypt's 72-byte limitation.

    Bcrypt has a 72-byte limit. For passwords that might exceed this,
    we hash them with SHA-256 first, which always produces a fixed 64-char hex string.

    Args:
        password: Plain-text password

    Returns:
        SHA-256 hex digest of the password
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt with SHA-256 pre-hashing.

    This handles bcrypt's 72-byte limitation by pre-hashing long passwords.
    The SHA-256 digest is always 64 characters, well under bcrypt's limit.

    Args:
        password: Plain-text password (any length)

    Returns:
        Hashed password string (bcrypt format)

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> hashed.startswith("$2b$")
        True
    """
    # Pre-hash to handle long passwords and ensure consistent length
    prehashed = _prehash_password(password)
    return pwd_context.hash(prehashed)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.

    Uses SHA-256 pre-hashing for new passwords, but falls back to
    direct verification for legacy passwords (backward compatibility).

    Args:
        plain_password: Plain-text password to verify (any length)
        hashed_password: Bcrypt hashed password

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    # Try verifying with SHA-256 pre-hashing (new method)
    prehashed = _prehash_password(plain_password)
    if pwd_context.verify(prehashed, hashed_password):
        return True

    # Fall back to direct verification for legacy passwords (old method)
    # This ensures existing users can still log in after the update
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If both methods fail, password is incorrect
        return False
