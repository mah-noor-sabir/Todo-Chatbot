"""
Simple in-memory cache for performance optimization.
"""

import asyncio
from typing import Any, Optional
from datetime import datetime, timedelta

class InMemoryCache:
    """Simple in-memory cache with TTL support."""

    def __init__(self):
        self._cache = {}
        self._ttl = {}

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set a value with TTL."""
        self._cache[key] = value
        self._ttl[key] = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def get(self, key: str) -> Optional[Any]:
        """Get a value, returns None if expired or not found."""
        if key not in self._cache:
            return None

        if key in self._ttl and datetime.utcnow() > self._ttl[key]:
            del self._cache[key]
            del self._ttl[key]
            return None

        return self._cache[key]

    def delete(self, key: str) -> None:
        """Delete a key from cache."""
        self._cache.pop(key, None)
        self._ttl.pop(key, None)

    def clear(self) -> None:
        """Clear all cache."""
        self._cache.clear()
        self._ttl.clear()

# Global cache instance
cache = InMemoryCache()