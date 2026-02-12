"""
Todo repository for data access.
Handles all database operations for Todo entity with user-scoped queries.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import List, Optional
import json
from datetime import datetime

from src.models.todo import Todo


class TodoRepository:
    """Repository for Todo entity data access. All queries scoped by user_id."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_todo(
        self,
        user_id: int,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
        tags: List[str] = None,
        due_date: Optional[str] = None,
        recurrence: Optional[str] = None,
    ) -> Todo:
        """
        Create a new todo for a user.

        Args:
            user_id: Owner's user ID
            title: Todo title (validated by caller)
            description: Optional description
            priority: Todo priority (high/medium/low)
            tags: List of tags
            due_date: Optional due date
            recurrence: Optional recurrence pattern

        Returns:
            Created Todo entity
        """
        tags_json = json.dumps(tags) if tags else "[]"
        todo = Todo(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            tags=tags_json,
            due_date=due_date,
            recurrence=recurrence,
        )
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def get_todos_by_user(self, user_id: int) -> List[Todo]:
        """
        Get all todos for a user, sorted by created_at descending (newest first).
        Spec requirement: FR-024

        Args:
            user_id: User ID to filter by

        Returns:
            List of Todo entities (empty list if no todos)
        """
        statement = (
            select(Todo)
            .where(Todo.user_id == user_id)
            .order_by(desc(Todo.created_at))  # Newest first
        )
        result = await self.session.execute(statement.execution_options(populate_existing=True))
        return list(result.scalars().all())

    async def get_todo_by_id_and_user(self, todo_id: int, user_id: int) -> Optional[Todo]:
        """
        Get a single todo by ID, ensuring it belongs to the user.
        Returns None if todo doesn't exist OR belongs to different user (security).

        Args:
            todo_id: Todo ID
            user_id: User ID (ownership check)

        Returns:
            Todo if found and owned by user, None otherwise
        """
        statement = select(Todo).where(and_(Todo.id == todo_id, Todo.user_id == user_id))
        result = await self.session.execute(statement.execution_options(populate_existing=True))
        return result.scalar_one_or_none()

    async def update_todo(
        self,
        todo: Todo,
        title: str,
        description: Optional[str],
        priority: str = "medium",
        tags: List[str] = None,
        due_date: Optional[str] = None,
        recurrence: Optional[str] = None,
    ) -> Todo:
        """
        Update todo with all fields.

        Args:
            todo: Todo entity to update (ownership already validated)
            title: New title
            description: New description
            priority: New priority
            tags: New tags list
            due_date: New due date
            recurrence: New recurrence pattern

        Returns:
            Updated Todo entity
        """
        todo.title = title
        todo.description = description
        todo.priority = priority
        todo.tags = json.dumps(tags) if tags else "[]"
        todo.due_date = due_date
        todo.recurrence = recurrence
        todo.updated_at = datetime.utcnow()  # Update timestamp - consistent with update_todo_priority
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def update_todo_priority(self, todo: Todo, priority: str) -> Todo:
        """
        Update only the priority of a todo.

        Args:
            todo: Todo entity to update
            priority: New priority value

        Returns:
            Updated Todo entity
        """
        todo.priority = priority
        todo.updated_at = datetime.utcnow()
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def toggle_completion(self, todo: Todo, is_completed: bool) -> Todo:
        """
        Toggle todo completion status.

        Args:
            todo: Todo entity to update (ownership already validated)
            is_completed: New completion status

        Returns:
            Updated Todo entity
        """
        todo.is_completed = is_completed
        todo.updated_at = datetime.utcnow()  # Update timestamp - consistent with update_todo_priority
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def delete_todo(self, todo: Todo) -> None:
        """
        Delete a todo permanently.

        Args:
            todo: Todo entity to delete (ownership already validated)
        """
        await self.session.delete(todo)
        await self.session.commit()
