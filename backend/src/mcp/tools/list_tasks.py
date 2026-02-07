from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal, Optional
from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult
from .bulk_operation_guard import BulkOperationGuard


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


async def delete_tasks_bulk(
    session: AsyncSession,
    user_id: int,
    status: Optional[str] = None
) -> ToolResult:
    """
    Bulk delete function for deleting multiple tasks at once.
    This function will be called after confirmation is received.
    """
    try:
        repository = TodoRepository(session)

        # Get all todos for the user
        all_todos = await repository.get_todos_by_user(user_id)

        # Filter based on status
        if status == "completed":
            todos_to_delete = [todo for todo in all_todos if todo.is_completed]
        elif status == "incomplete":
            todos_to_delete = [todo for todo in all_todos if not todo.is_completed]
        else:
            todos_to_delete = all_todos

        deleted_count = 0
        for todo in todos_to_delete:
            await repository.delete_todo(todo)
            deleted_count += 1

        return ToolResult(
            success=True,
            data={
                "deleted_count": deleted_count,
                "status_filter": status
            },
            message=f"Successfully deleted {deleted_count} {'completed' if status == 'completed' else 'all'} tasks"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to bulk delete tasks: {str(e)}"
        )