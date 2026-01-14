from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def list_tasks(
    session: AsyncSession,
    user_id: int,
    status: Literal["all", "completed", "incomplete"] = "all"
) -> ToolResult:
    try:
        # Use the same repository method as the regular API for consistency
        repository = TodoRepository(session)

        # Get all todos for the user using the same method as regular API
        all_todos = await repository.get_todos_by_user(user_id)

        # Apply status filter if specified
        if status == "completed":
            todos = [todo for todo in all_todos if todo.is_completed]
        elif status == "incomplete":
            todos = [todo for todo in all_todos if not todo.is_completed]
        else:  # "all"
            todos = all_todos

        tasks = [
            {
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "completed": todo.is_completed,
                "created_at": todo.created_at.isoformat()
            }
            for todo in todos
        ]

        return ToolResult(
            success=True,
            data={"tasks": tasks, "count": len(tasks)},
            message=f"Found {len(tasks)} task(s)"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to retrieve tasks: {str(e)}"
        )
