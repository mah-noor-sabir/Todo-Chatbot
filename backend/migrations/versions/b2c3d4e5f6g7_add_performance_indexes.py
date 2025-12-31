"""Add performance indexes to todos table

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add composite index for user queries (most common query)
    op.create_index('ix_todos_user_completed', 'todos', ['user_id', 'is_completed'], if_not_exists=True)

    # Add index for priority filtering
    op.create_index('ix_todos_priority', 'todos', ['priority'], if_not_exists=True)

    # Add index for due date sorting/filtering
    op.create_index('ix_todos_due_date', 'todos', ['due_date'], if_not_exists=True)

    # Add index for recurrence filtering
    op.create_index('ix_todos_recurrence', 'todos', ['recurrence'], if_not_exists=True)

    # Add index for created_at sorting (already used in ORDER BY)
    op.create_index('ix_todos_created_at', 'todos', ['created_at'], if_not_exists=True)


def downgrade() -> None:
    op.drop_index('ix_todos_created_at', table_name='todos', if_exists=True)
    op.drop_index('ix_todos_recurrence', table_name='todos', if_exists=True)
    op.drop_index('ix_todos_due_date', table_name='todos', if_exists=True)
    op.drop_index('ix_todos_priority', table_name='todos', if_exists=True)
    op.drop_index('ix_todos_user_completed', table_name='todos', if_exists=True)
