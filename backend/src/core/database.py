"""
Database connection and session management.
Provides async SQLAlchemy engine and session factory for PostgreSQL or SQLite.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlmodel import SQLModel
from typing import AsyncGenerator
import urllib.parse

from .config import settings

def create_engine():
    """Create database engine with appropriate settings based on database type."""
    if settings.DATABASE_URL.startswith("sqlite"):
        # SQLite-specific configuration
        return create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
            connect_args={"check_same_thread": False}  # Required for SQLite
        )
    else:
        # PostgreSQL-specific configuration
        return create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
            future=True,
            pool_pre_ping=True,  # Verify connections before using
            pool_size=10,  # Connection pool size
            max_overflow=5,  # Additional connections for spikes
        )

# Create async engine based on database type
engine = create_engine()

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database sessions.
    Provides async session per request with automatic cleanup.

    Usage:
        @app.get("/endpoint")
        async def endpoint(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        else:
            await session.commit()
        finally:
            await session.close()


async def create_db_and_tables():
    """Create all database tables. Run on application startup."""
    async with engine.begin() as conn:
        # For SQLite, we need to handle table creation differently
        if str(settings.DATABASE_URL).startswith("sqlite"):
            # For SQLite, use the synchronous method
            await conn.run_sync(SQLModel.metadata.create_all)
        else:
            # For PostgreSQL and other databases
            await conn.run_sync(SQLModel.metadata.create_all)


async def close_db_connection():
    """Close database connection pool. Run on application shutdown."""
    await engine.dispose()
