#!/bin/bash
# Startup script for Hugging Face Space

# Change to the parent directory where the source code is
cd ..

# Run database migrations
alembic upgrade head

# Start the FastAPI application
python -m uvicorn src.main:app --host 0.0.0.0 --port $PORT