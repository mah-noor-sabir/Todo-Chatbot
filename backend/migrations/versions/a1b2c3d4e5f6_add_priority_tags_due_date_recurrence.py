"""Add priority, tags, due_date, recurrence to todos table

Revision ID: a1b2c3d4e5f6
Revises: 5aab8d879e8e
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '5aab8d879e8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add priority column with default 'medium'
    op.add_column('todos', sa.Column('priority', sa.VARCHAR(length=20), server_default='medium', nullable=False))

    # Add tags column as JSON string with default '[]'
    op.add_column('todos', sa.Column('tags', sa.VARCHAR(length=1000), server_default='[]', nullable=False))

    # Add due_date column (nullable TIMESTAMP)
    op.add_column('todos', sa.Column('due_date', sa.TIMESTAMP(), nullable=True))

    # Add recurrence column (nullable VARCHAR)
    op.add_column('todos', sa.Column('recurrence', sa.VARCHAR(length=20), nullable=True))


def downgrade() -> None:
    # Remove the columns in reverse order
    op.drop_column('todos', 'recurrence')
    op.drop_column('todos', 'due_date')
    op.drop_column('todos', 'tags')
    op.drop_column('todos', 'priority')
