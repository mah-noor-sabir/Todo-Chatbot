"""add first_name and last_name to users

Revision ID: add_user_names_001
Revises: <previous_revision_id>
Create Date: 2026-01-02 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_names_001'
down_revision = 'c4d5e6f7g8h9'  # Points to the conversations/messages migration
branch_labels = None
depends_on = None


def upgrade():
    """Add first_name and last_name columns to users table."""

    # Add first_name and last_name columns as nullable first
    op.add_column('users', sa.Column('first_name', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=50), nullable=True))

    # Set default values for existing users (if any exist in the database)
    # This ensures we can make the columns NOT NULL without violating constraints
    op.execute("""
        UPDATE users
        SET first_name = 'Unknown', last_name = 'User'
        WHERE first_name IS NULL OR last_name IS NULL
    """)

    # Now make the columns NOT NULL
    op.alter_column('users', 'first_name',
                    existing_type=sa.String(length=50),
                    nullable=False)
    op.alter_column('users', 'last_name',
                    existing_type=sa.String(length=50),
                    nullable=False)


def downgrade():
    """Remove first_name and last_name columns from users table."""
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
