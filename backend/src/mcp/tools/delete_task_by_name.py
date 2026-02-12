from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def delete_task_by_name(
    session: AsyncSession,
    user_id: int,
    title: str
) -> ToolResult:
    if not title or len(title.strip()) == 0:
        return ToolResult(
            success=False,
            error="INVALID_INPUT",
            message="Title cannot be empty"
        )

    try:
        repository = TodoRepository(session)
        
        # Get all todos for the user
        all_todos = await repository.get_todos_by_user(user_id)
        
        # Find the task with the matching title (prioritize exact matches first)
        matching_todo = None
        title_lower = title.strip().lower()
        
        # First, look for exact matches
        for todo in all_todos:
            if todo.title.lower() == title_lower:
                matching_todo = todo
                break
        
        # If no exact match found, look for partial matches
        if not matching_todo:
            for todo in all_todos:
                if title_lower in todo.title.lower():
                    matching_todo = todo
                    break
        
        if not matching_todo:
            return ToolResult(
                success=False,
                error="TASK_NOT_FOUND",
                message=f"No task found with title containing '{title}'"
            )
        
        # Delete the found task
        await repository.delete_todo(matching_todo)
        
        return ToolResult(
            success=True,
            data={
                "task_id": matching_todo.id,
                "title": matching_todo.title,
                "deleted": True
            },
            message=f"Task '{matching_todo.title}' deleted successfully"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to delete task: {str(e)}"
        )