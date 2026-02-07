from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional


class BulkOperationGuard:
    """
    Safety guard for bulk operations to prevent unintended destructive actions.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def requires_confirmation(
        self,
        user_id: int,
        operation_type: str,
        operation_params: Dict[str, Any]
    ) -> tuple[bool, str]:
        """
        Determine if an operation requires explicit user confirmation.

        Args:
            user_id: The user performing the operation
            operation_type: Type of operation (e.g., "delete_tasks", "complete_tasks")
            operation_params: Parameters for the operation

        Returns:
            Tuple of (requires_confirmation, reason_message)
        """
        from src.repositories.todo_repository import TodoRepository

        if operation_type == "delete_tasks" and operation_params.get("status") == "completed":
            # Check if this is a "delete all completed tasks" operation
            repository = TodoRepository(self.session)

            # Get all todos for the user
            all_todos = await repository.get_todos_by_user(user_id)
            completed_todos = [todo for todo in all_todos if todo.is_completed]

            # If more than 5 completed tasks, require confirmation
            if len(completed_todos) > 5:
                return True, f"This will delete {len(completed_todos)} completed tasks. Are you sure you want to proceed?"

        elif operation_type == "delete_all":
            # Check if this is a "clear all tasks" operation
            repository = TodoRepository(self.session)
            all_todos = await repository.get_todos_by_user(user_id)

            if len(all_todos) > 5:
                return True, f"This will delete all {len(all_todos)} tasks. Are you sure you want to proceed?"

        return False, ""

    async def get_task_count(
        self,
        user_id: int,
        status_filter: Optional[str] = None
    ) -> int:
        """
        Get the count of tasks that match the criteria.

        Args:
            user_id: The user whose tasks to count
            status_filter: Optional filter ("completed", "incomplete", None for all)

        Returns:
            Number of tasks matching the criteria
        """
        from src.repositories.todo_repository import TodoRepository

        repository = TodoRepository(self.session)
        all_todos = await repository.get_todos_by_user(user_id)

        if status_filter == "completed":
            return len([todo for todo in all_todos if todo.is_completed])
        elif status_filter == "incomplete":
            return len([todo for todo in all_todos if not todo.is_completed])
        else:
            return len(all_todos)