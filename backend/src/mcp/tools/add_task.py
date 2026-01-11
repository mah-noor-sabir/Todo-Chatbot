from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def add_task(
    session: AsyncSession,
    user_id: int,
    title: str,
    description: Optional[str] = None
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

    try:
        repository = TodoRepository(session)
        todo = await repository.create_todo(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None
        )

        return ToolResult(
            success=True,
            data={
                "task_id": todo.id,
                "title": todo.title,
                "description": todo.description,
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
