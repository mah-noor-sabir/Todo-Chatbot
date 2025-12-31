"""
Todo CRUD API routes.
All endpoints require authentication and enforce user-scoped data access.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.core.database import get_session as get_db_session
from src.models.user import User
from src.models.todo import TodoCreate, TodoUpdate, TodoToggle, TodoResponse
from src.services.todo_service import TodoService
from src.api.middleware.auth import get_current_user

router = APIRouter()


@router.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Create a new todo for the authenticated user.
    Spec requirements: FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022

    Request Body:
        - title: Todo title (required, 1-200 chars)
        - description: Optional description (max 1000 chars)
        - priority: Optional priority (high/medium/low, default: medium)
        - tags: Optional list of tags
        - due_date: Optional due date
        - recurrence: Optional recurrence pattern (daily/weekly/monthly/yearly)

    Returns:
        TodoResponse: Created todo with all fields

    Errors:
        - 400: Validation error
        - 401: Not authenticated
        - 500: Server error
    """
    todo_service = TodoService(session)
    todo = await todo_service.create_todo(current_user.id, todo_data)
    return TodoResponse.from_orm(todo)


@router.get("/todos", response_model=List[TodoResponse])
async def get_todos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get all todos for the authenticated user, sorted newest first.
    Spec requirements: FR-023, FR-024, FR-025

    Returns:
        List[TodoResponse]: User's todos (empty array if none)

    Errors:
        - 401: Not authenticated
        - 500: Server error
    """
    todo_service = TodoService(session)
    todos = await todo_service.get_user_todos(current_user.id)
    return [TodoResponse.from_orm(todo) for todo in todos]


@router.get("/todos/{id}", response_model=TodoResponse)
async def get_todo_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get a single todo by ID (ownership validated).
    Spec requirements: FR-026, FR-027

    Args:
        id: Todo ID

    Returns:
        TodoResponse: Todo details

    Errors:
        - 401: Not authenticated
        - 404: Todo not found or belongs to another user
        - 500: Server error
    """
    todo_service = TodoService(session)
    todo = await todo_service.get_todo_by_id(id, current_user.id)
    return TodoResponse.from_orm(todo)


@router.put("/todos/{id}", response_model=TodoResponse)
async def update_todo(
    id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Update todo (all fields with ownership validated).
    Spec requirements: FR-028, FR-029, FR-031, FR-032, FR-012

    Args:
        id: Todo ID
        todo_data: Updated data (title, description, priority, tags, due_date, recurrence)

    Returns:
        TodoResponse: Updated todo

    Errors:
        - 400: Validation error
        - 401: Not authenticated
        - 404: Todo not found or belongs to another user
        - 500: Server error
    """
    todo_service = TodoService(session)
    todo = await todo_service.update_todo(id, current_user.id, todo_data)
    return TodoResponse.from_orm(todo)


@router.patch("/todos/{id}", response_model=TodoResponse)
async def toggle_todo_completion(
    id: int,
    toggle_data: TodoToggle,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Toggle todo completion status (ownership validated).
    Spec requirements: FR-030, FR-031, FR-032, FR-013

    Args:
        id: Todo ID
        toggle_data: New completion status

    Returns:
        TodoResponse: Updated todo

    Errors:
        - 401: Not authenticated
        - 404: Todo not found or belongs to another user
        - 500: Server error
    """
    todo_service = TodoService(session)
    todo = await todo_service.toggle_completion(id, current_user.id, toggle_data)
    return TodoResponse.from_orm(todo)


@router.delete("/todos/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Delete a todo permanently (ownership validated).
    Spec requirements: FR-033, FR-034, FR-035, FR-036, FR-013

    Args:
        id: Todo ID

    Returns:
        204 No Content

    Errors:
        - 401: Not authenticated
        - 404: Todo not found or belongs to another user
        - 500: Server error
    """
    todo_service = TodoService(session)
    await todo_service.delete_todo(id, current_user.id)
    return None
