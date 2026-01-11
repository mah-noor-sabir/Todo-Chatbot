from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def update_task(
    session: AsyncSession,
    user_id: int,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> ToolResult:
    if not title and description is None:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="At least one of title or description must be provided"
        )

    if title and len(title) > 200:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Title cannot exceed 200 characters"
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

        updated_title = title.strip() if title else todo.title
        updated_description = description.strip() if description else todo.description

        updated_todo = await repository.update_todo(
            todo=todo,
            title=updated_title,
            description=updated_description,
            priority=todo.priority,
            tags=[]
        )

        return ToolResult(
            success=True,
            data={
                "task_id": updated_todo.id,
                "title": updated_todo.title,
                "description": updated_todo.description,
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
