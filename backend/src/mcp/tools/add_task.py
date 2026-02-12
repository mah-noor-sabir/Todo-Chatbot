from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import json
from datetime import datetime

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def add_task(
    session: AsyncSession,
    user_id: int,
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = "medium",
    tags: Optional[List[str]] = None,
    due_date: Optional[str] = None,
    recurrence: Optional[str] = None
) -> ToolResult:
    if not title or len(title.strip()) == 0:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Title cannot be empty"
        )

    if len(title) > 200:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Title cannot exceed 200 characters"
        )

    # Validate priority if provided
    if priority and priority not in ["high", "medium", "low"]:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Priority must be 'high', 'medium', or 'low'"
        )

    # Validate recurrence if provided
    if recurrence and recurrence not in ["daily", "weekly", "monthly", "yearly"]:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Recurrence must be 'daily', 'weekly', 'monthly', or 'yearly'"
        )

    # Parse due_date if provided
    parsed_due_date = None
    if due_date:
        try:
            parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            return ToolResult(
                success=False,
                error="INVALID_INPUT",
                message="Due date must be in ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)"
            )

    try:
        repository = TodoRepository(session)
        todo = await repository.create_todo(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None,
            priority=priority,
            tags=tags or [],
            due_date=parsed_due_date,
            recurrence=recurrence
        )

        return ToolResult(
            success=True,
            data={
                "task_id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "priority": todo.priority,
                "tags": json.loads(todo.tags) if todo.tags else [],
                "due_date": todo.due_date.isoformat() if todo.due_date else None,
                "recurrence": todo.recurrence,
                "completed": todo.is_completed
            },
            message=f"Task created successfully"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to create task: {str(e)}"
        )
