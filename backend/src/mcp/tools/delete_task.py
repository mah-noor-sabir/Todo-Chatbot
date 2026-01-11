from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def delete_task(
    session: AsyncSession,
    user_id: int,
    task_id: int
) -> ToolResult:
    try:
        repository = TodoRepository(session)
        todo = await repository.get_todo_by_id_and_user(task_id, user_id)

        if not todo:
            return ToolResult(
                success=False,
                error="TASK_NOT_FOUND",
                message=f"Task with ID {task_id} not found"
            )

        title = todo.title
        await repository.delete_todo(todo)

        return ToolResult(
            success=True,
            data={
                "task_id": task_id,
                "title": title
            },
            message="Task deleted successfully"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to delete task: {str(e)}"
        )
