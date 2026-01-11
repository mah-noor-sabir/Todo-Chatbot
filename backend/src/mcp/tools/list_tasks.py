from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Literal

from src.models.todo import Todo
from src.mcp.schemas import ToolResult


async def list_tasks(
    session: AsyncSession,
    user_id: int,
    status: Literal["all", "completed", "incomplete"] = "all"
) -> ToolResult:
    try:
        stmt = select(Todo).where(Todo.user_id == user_id).order_by(desc(Todo.created_at))

        if status == "completed":
            stmt = stmt.where(Todo.is_completed == True)
        elif status == "incomplete":
            stmt = stmt.where(Todo.is_completed == False)

        result = await session.execute(stmt)
        todos = list(result.scalars().all())

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
