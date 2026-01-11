from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult


async def complete_task(
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

        updated_todo = await repository.toggle_completion(todo, True)

        return ToolResult(
            success=True,
            data={
                "task_id": updated_todo.id,
                "title": updated_todo.title,
                "completed": updated_todo.is_completed
            },
            message="Task marked as completed"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error="DATABASE_ERROR",
            message=f"Failed to complete task: {str(e)}"
        )
