"""
FastAPI application entry point.
Initializes the application, middleware, and routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.core.config import settings
from src.core.database import create_db_and_tables, close_db_connection
from src.api.routes import health, auth, todos, chat
from src.api.middleware.error import register_exception_handlers
from src.api.middleware.db_session import DBSessionMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create DB tables on startup, close connections on shutdown."""
    await create_db_and_tables()
    yield
    await close_db_connection()


# Initialize FastAPI app
app = FastAPI(
    title="Taskify API",
    description="Phase II - Full-Stack Web Application with Authentication",
    version="1.0.0",
    lifespan=lifespan,
)

# Add database session middleware first
app.add_middleware(DBSessionMiddleware)

# CORS middleware - CRITICAL for localhost React + FastAPI cookie-based auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # ["http://localhost:3000"]
    allow_credentials=True,  # ✅ REQUIRED for cookies
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers to frontend
)

# Register exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(todos.router, tags=["Todos"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "Taskify API",
        "version": "1.0.0",
        "phase": "II",
        "status": "operational",
    }
