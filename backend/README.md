# Taskify Backend API

This is the backend API for the Taskify Todo Chatbot application, deployed on Hugging Face Spaces.

## Overview

This FastAPI application provides:
- User authentication and authorization
- Todo CRUD operations
- AI chatbot integration with natural language processing
- Conversation history management

## Environment Variables

The following environment variables need to be configured:

- `DATABASE_URL`: PostgreSQL database connection string
- `SECRET_KEY`: Secret key for JWT tokens (min 32 chars)
- `OPENROUTER_API_KEY`: API key for OpenRouter (for AI functionality)
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## API Endpoints

- `GET /` - Health check
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/session` - Get current session
- `GET /todos` - Get user's todos
- `POST /todos` - Create a new todo
- `PUT /todos/{id}` - Update a todo
- `DELETE /todos/{id}` - Delete a todo
- `POST /todos/{id}/toggle` - Toggle todo completion
- `POST /api/chat` - Chat with the AI assistant

## Architecture

Built with FastAPI, SQLModel, and PostgreSQL, featuring:
- Three-layer architecture (domain, application, infrastructure)
- Async database operations
- Proper error handling
- Type validation with Pydantic
- AI integration with OpenRouter