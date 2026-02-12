from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import json
from datetime import datetime

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def update_task(
    session: AsyncSession,
    user_id: int,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    due_date: Optional[str] = None,
    recurrence: Optional[str] = None
) -> ToolResult:
    if not title and description is None and priority is None and tags is None and due_date is None and recurrence is None:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="At least one field (title, description, priority, tags, due_date, recurrence) must be provided"
        )

    if title and len(title) > 200:
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
        todo = await repository.get_todo_by_id_and_user(task_id, user_id)

        if not todo:
            return ToolResult(
                success=False,
                error="TASK_NOT_FOUND",
                message=f"Task with ID {task_id} not found"
            )

        # Prepare updated values
        updated_title = title.strip() if title else todo.title
        updated_description = description.strip() if description else todo.description
        updated_priority = priority if priority else todo.priority
        updated_tags = tags if tags is not None else json.loads(todo.tags) if todo.tags else []
        updated_due_date = parsed_due_date if due_date else todo.due_date
        updated_recurrence = recurrence if recurrence is not None else todo.recurrence

        updated_todo = await repository.update_todo(
            todo=todo,
            title=updated_title,
            description=updated_description,
            priority=updated_priority,
            tags=updated_tags,
            due_date=updated_due_date,
            recurrence=updated_recurrence
        )

        return ToolResult(
            success=True,
            data={
                "task_id": updated_todo.id,
                "title": updated_todo.title,
                "description": updated_todo.description,
                "priority": updated_todo.priority,
                "tags": json.loads(updated_todo.tags) if updated_todo.tags else [],
                "due_date": updated_todo.due_date.isoformat() if updated_todo.due_date else None,
                "recurrence": updated_todo.recurrence,
                "completed": updated_todo.is_completed
            },
            message="Task updated successfully"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to update task: {str(e)}"
        )
