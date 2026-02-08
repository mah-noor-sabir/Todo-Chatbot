#!/bin/bash
# Startup script for Hugging Face Space

# Run database migrations
alembic upgrade head

# Start the FastAPI application
python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT