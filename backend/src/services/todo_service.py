"""
Todo service.
Business logic for todo CRUD operations with validation and ownership checks.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.models.todo import Todo, TodoCreate, TodoUpdate, TodoToggle
from src.repositories.todo_repository import TodoRepository
from src.core.exceptions import NotFoundError, ForbiddenError
from src.services.validation import validate_todo_title, validate_todo_description


class TodoService:
    """Service layer for todo operations."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.todo_repo = TodoRepository(session)

    async def create_todo(self, user_id: int, todo_data: TodoCreate) -> Todo:
        """
        Create a new todo for a user.
        Validates title and description per spec.

        Args:
            user_id: Owner's user ID
            todo_data: Todo creation data (includes priority, tags, due_date, recurrence)

        Returns:
            Created Todo entity

        Raises:
            ValidationError: If title/description invalid
        """
        # Validate title and description
        title = validate_todo_title(todo_data.title)
        description = validate_todo_description(todo_data.description)

        # Convert tags list to JSON-serializable format
        tags = todo_data.tags or []

        # Create todo with all fields
        todo = await self.todo_repo.create_todo(
            user_id=user_id,
            title=title,
            description=description,
            priority=todo_data.priority or "medium",
            tags=tags,
            due_date=todo_data.due_date,
            recurrence=todo_data.recurrence,
        )
        return todo

    async def get_user_todos(self, user_id: int) -> List[Todo]:
        """
        Get all todos for a user, sorted by created_at descending.
        Spec requirement: FR-023, FR-024

        Args:
            user_id: User ID

        Returns:
            List of Todo entities (empty list if no todos)
        """
        todos = await self.todo_repo.get_todos_by_user(user_id)
        return todos

    async def get_todo_by_id(self, todo_id: int, user_id: int) -> Todo:
        """
        Get a single todo by ID with ownership validation.
        Spec requirement: FR-026, FR-027

        Args:
            todo_id: Todo ID
            user_id: User ID (for ownership check)

        Returns:
            Todo entity

        Raises:
            NotFoundError: If todo doesn't exist or belongs to another user
        """
        todo = await self.todo_repo.get_todo_by_id_and_user(todo_id, user_id)

        if not todo:
            raise NotFoundError("Todo not found")

        return todo

    async def update_todo(self, todo_id: int, user_id: int, todo_data: TodoUpdate) -> Todo:
        """
        Update todo with all fields (title, description, priority, tags, due_date, recurrence).
        Ownership validated.
        Spec requirements: FR-028, FR-029, FR-012

        Args:
            todo_id: Todo ID to update
            user_id: User ID (for ownership check)
            todo_data: Updated data including all fields

        Returns:
            Updated Todo entity

        Raises:
            NotFoundError: If todo doesn't exist or belongs to another user
            ValidationError: If title/description invalid
        """
        # Get todo (validates ownership)
        todo = await self.get_todo_by_id(todo_id, user_id)

        # Validate new data
        title = validate_todo_title(todo_data.title)
        description = validate_todo_description(todo_data.description)

        # Convert tags list
        tags = todo_data.tags or []

        # Update with all fields
        updated_todo = await self.todo_repo.update_todo(
            todo=todo,
            title=title,
            description=description,
            priority=todo_data.priority or "medium",
            tags=tags,
            due_date=todo_data.due_date,
            recurrence=todo_data.recurrence,
        )
        return updated_todo

    async def toggle_completion(self, todo_id: int, user_id: int, toggle_data: TodoToggle) -> Todo:
        """
        Toggle todo completion status with ownership validation.
        Spec requirement: FR-030

        Args:
            todo_id: Todo ID
            user_id: User ID (for ownership check)
            toggle_data: New completion status

        Returns:
            Updated Todo entity

        Raises:
            NotFoundError: If todo doesn't exist or belongs to another user
        """
        # Get todo (validates ownership)
        todo = await self.get_todo_by_id(todo_id, user_id)

        # Toggle completion
        updated_todo = await self.todo_repo.toggle_completion(todo, toggle_data.is_completed)
        return updated_todo

    async def delete_todo(self, todo_id: int, user_id: int) -> None:
        """
        Delete a todo with ownership validation.
        Spec requirements: FR-033, FR-034, FR-013

        Args:
            todo_id: Todo ID to delete
            user_id: User ID (for ownership check)

        Raises:
            NotFoundError: If todo doesn't exist or belongs to another user
        """
        # Get todo (validates ownership)
        todo = await self.get_todo_by_id(todo_id, user_id)

        # Delete
        await self.todo_repo.delete_todo(todo)
