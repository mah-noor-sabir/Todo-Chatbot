# Data Model: Phase II Full-Stack Web Application

**Date**: 2025-12-28
**Feature**: Phase II - Full-Stack Web Application
**Database**: Neon Serverless PostgreSQL
**ORM**: SQLModel (Pydantic + SQLAlchemy)

## Overview

Phase II data model consists of two primary entities: **User** and **Todo**. The model enforces user-scoped data isolation (each todo belongs to exactly one user), supports all CRUD operations from the specification, and aligns with Clean Architecture principles (domain models independent of infrastructure).

## Entity Definitions

### User Entity

**Purpose**: Represents a registered user account with authentication credentials.

**Attributes**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User's email address (login identifier) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (never store plain text) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last account modification timestamp |

**Relationships**:
- **One-to-Many with Todo**: One user owns zero or more todos

**Constraints**:
- **Unique Email**: `UNIQUE INDEX idx_users_email ON users(email)` - enforces one account per email
- **Not Null**: Email and password_hash required for authentication
- **Email Format**: Validated at application layer (Pydantic validator), database stores as string

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password_hash": "$2b$12$..."
            }
        }
```

**Indexes**:
- `idx_users_email` (UNIQUE): Fast email lookup for signin, enforce uniqueness

**Security Notes**:
- Password stored as bcrypt hash (work factor 12)
- Never return `password_hash` in API responses (exclude from Pydantic response models)
- Email uniqueness prevents duplicate registrations

---

### Todo Entity

**Purpose**: Represents a task item with title, description, and completion status, scoped to a single user.

**Attributes**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| `user_id` | INTEGER | FOREIGN KEY → users(id), NOT NULL, INDEX | Owner of this todo |
| `title` | VARCHAR(200) | NOT NULL, CHECK (length > 0) | Task title (max 200 chars, spec requirement) |
| `description` | VARCHAR(1000) | NULL | Optional task description (max 1000 chars, spec requirement) |
| `is_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status (false = incomplete, true = complete) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Todo creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

**Relationships**:
- **Many-to-One with User**: Each todo belongs to exactly one user
- **Foreign Key**: `todos.user_id` → `users.id` with `ON DELETE CASCADE`

**Constraints**:
- **Not Null**: `user_id`, `title`, `is_completed` required
- **Foreign Key**: `user_id` must reference existing user
- **Cascade Delete**: Deleting user automatically deletes all their todos
- **Title Length**: 1-200 characters (validated at application layer)
- **Description Length**: 0-1000 characters (validated at application layer)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "is_completed": False
            }
        }
```

**Indexes**:
- `idx_todos_user_created` (COMPOSITE): `(user_id, created_at DESC)` - optimizes "get user's todos ordered by newest first" query (primary use case)
- `user_id` alone indexed via foreign key

**Query Optimization Notes**:
- Most queries filter by `user_id` (data isolation)
- Default sort: `created_at DESC` (newest first, per spec requirement FR-024)
- Composite index `(user_id, created_at DESC)` enables efficient sorted retrieval without separate sort operation

---

## Relationships

### User → Todo (One-to-Many)

**Cardinality**: One User has Zero or More Todos

**Direction**: Unidirectional (Todo references User, User doesn't reference Todos in model)

**Foreign Key**: `todos.user_id` → `users.id`

**Delete Behavior**: `ON DELETE CASCADE` - deleting user deletes all their todos (spec requirement: user-scoped data)

**SQLAlchemy Relationship** (optional, for convenience):
```python
from sqlmodel import Relationship

class User(SQLModel, table=True):
    # ... fields ...
    todos: list["Todo"] = Relationship(back_populates="owner", cascade_delete=True)

class Todo(SQLModel, table=True):
    # ... fields ...
    owner: User = Relationship(back_populates="todos")
```

**Note**: Relationship definitions are optional in SQLModel. For Phase II, simple foreign key is sufficient. Relationship models can be added if complex joins are needed in future phases.

---

## Database Schema (SQL)

### Create Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique index on email (enforces uniqueness, speeds up signin)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Composite index for efficient user-scoped queries sorted by created_at
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);
```

### Triggers (for updated_at auto-update)

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for todos table
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Migrations

### Migration Tool: Alembic

**Configuration**:
- **Database URL**: From environment variable `DATABASE_URL` (Neon connection string)
- **Migration Directory**: `backend/migrations/versions/`
- **Autogenerate**: Compare SQLModel models to database, generate migration scripts

**Migration Workflow**:
1. **Modify Models**: Update SQLModel definitions in `backend/src/models/`
2. **Generate Migration**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Add todos table"
   ```
3. **Review Migration**: Check generated SQL in `migrations/versions/*.py`
4. **Test on Neon Branch**:
   ```bash
   # Create Neon branch for testing
   neon branches create --name test-migration

   # Run migration on branch
   alembic upgrade head

   # Test queries, verify schema
   # If issues, fix and regenerate migration
   ```
5. **Apply to Main Database**:
   ```bash
   # Switch to main branch
   neon branches set main

   # Apply migration
   alembic upgrade head
   ```
6. **Rollback (if needed)**:
   ```bash
   alembic downgrade -1  # Roll back one migration
   ```

### Initial Migration (0001_initial)

**Creates**: Users and Todos tables, indexes, triggers

**Generated by**: `alembic revision --autogenerate -m "Initial schema"`

**Up Migration**:
```python
def upgrade():
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # Create todos table
    op.create_table('todos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_todos_user_created', 'todos', ['user_id', 'created_at'], unique=False)

def downgrade():
    op.drop_index('idx_todos_user_created', table_name='todos')
    op.drop_table('todos')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_table('users')
```

---

## Query Patterns

### User Queries

**Create User (Signup)**:
```sql
INSERT INTO users (email, password_hash, created_at, updated_at)
VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, email, created_at, updated_at;
```

**Find User by Email (Signin)**:
```sql
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE email = $1;
```

**Get User by ID (Session Validation)**:
```sql
SELECT id, email, created_at, updated_at
FROM users
WHERE id = $1;
```

### Todo Queries

**Create Todo**:
```sql
INSERT INTO todos (user_id, title, description, is_completed, created_at, updated_at)
VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, user_id, title, description, is_completed, created_at, updated_at;
```

**Get All User's Todos (Newest First)**:
```sql
SELECT id, user_id, title, description, is_completed, created_at, updated_at
FROM todos
WHERE user_id = $1
ORDER BY created_at DESC;
```
**Index Used**: `idx_todos_user_created` - efficient query, no sort needed

**Get Single Todo (with Ownership Validation)**:
```sql
SELECT id, user_id, title, description, is_completed, created_at, updated_at
FROM todos
WHERE id = $1 AND user_id = $2;
```
**Returns Empty**: If todo doesn't exist OR belongs to different user (security)

**Update Todo**:
```sql
UPDATE todos
SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $3 AND user_id = $4
RETURNING id, user_id, title, description, is_completed, created_at, updated_at;
```

**Toggle Completion**:
```sql
UPDATE todos
SET is_completed = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND user_id = $3
RETURNING id, user_id, title, description, is_completed, created_at, updated_at;
```

**Delete Todo**:
```sql
DELETE FROM todos
WHERE id = $1 AND user_id = $2;
```
**Returns**: Number of rows deleted (0 if not found or wrong user)

---

## Data Validation

### Application-Layer Validation (Pydantic/SQLModel)

**User Email**:
- Format: RFC 5322 email format (regex validation)
- Uniqueness: Database constraint (unique index)
- Max Length: 255 characters

**User Password**:
- Minimum Length: 8 characters (spec requirement FR-003)
- Hashing: bcrypt with work factor 12 before storage

**Todo Title**:
- Required: NOT NULL, length > 0
- Max Length: 200 characters (spec requirement FR-018)
- Whitespace: Trim and reject whitespace-only strings (spec requirement FR-017)

**Todo Description**:
- Optional: Can be null
- Max Length: 1000 characters (spec requirement FR-019)

### Database-Layer Validation (Constraints)

- **NOT NULL**: Email, password_hash, title, user_id, is_completed, timestamps
- **UNIQUE**: Email (prevents duplicate accounts)
- **FOREIGN KEY**: user_id references users(id) (referential integrity)
- **CHECK**: (optional) Title length > 0 (redundant with application validation)
- **DEFAULT**: is_completed = FALSE, timestamps = CURRENT_TIMESTAMP

---

## Performance Considerations

### Indexing Strategy

**Current Indexes**:
1. `idx_users_email` (UNIQUE) - O(log n) email lookup for signin
2. `idx_todos_user_created` (COMPOSITE) - O(log n) user-scoped queries sorted by date

**Query Performance**:
- **Get User's Todos**: Uses `idx_todos_user_created`, no table scan, no sort operation
- **Signin**: Uses `idx_users_email`, single row lookup
- **Todo CRUD by ID**: Primary key lookup (implicit index), O(log n)

**Future Optimization Opportunities** (Phase III+):
- Partial index on incomplete todos: `CREATE INDEX idx_todos_incomplete ON todos(user_id) WHERE is_completed = FALSE;`
- Full-text search on title/description: PostgreSQL `tsvector` column + GIN index

### Connection Pooling

- **Pool Size**: 10-20 connections (adjust based on load testing)
- **Max Overflow**: 5 additional connections for spikes
- **Pool Timeout**: 30 seconds (return connection to pool or raise timeout error)
- **Connection Lifetime**: Recycle connections every hour (prevent stale connections)

### Query Optimization

- **Select Only Needed Columns**: Avoid `SELECT *` in production (though acceptable for Phase II simplicity)
- **Avoid N+1 Queries**: Use joins or batch queries (not needed for Phase II - no nested resources)
- **Pagination**: Deferred to future phase (spec assumption #9 - no pagination in Phase II)

---

## Security Considerations

### Data Isolation

- **User-Scoped Queries**: All todo queries filter by `user_id = current_user.id`
- **Ownership Validation**: Update/Delete queries include `user_id` in WHERE clause (returns 0 rows if wrong user)
- **No Cross-User Access**: Foreign key + application logic prevents accessing others' todos

### Password Security

- **Never Store Plain Text**: Password hashed with bcrypt before database insert
- **Work Factor**: bcrypt cost 12 (balance security vs. performance)
- **Salt**: bcrypt automatically generates unique salt per password
- **Timing Attack Mitigation**: bcrypt constant-time comparison

### Audit Trail

- **Created At**: Record when resource created (immutable)
- **Updated At**: Auto-update on every modification (trigger-based)
- **Future**: Add `deleted_at` for soft deletes (Phase III+), `last_login_at` for security monitoring

---

## Data Model Summary

**Entities**: 2 (User, Todo)
**Relationships**: 1 (User → Todo, one-to-many)
**Tables**: 2 (users, todos)
**Indexes**: 2 (users.email unique, todos.user_id+created_at composite)
**Constraints**: Foreign key (cascade delete), unique (email), not null, defaults
**Migration Tool**: Alembic
**Validation**: Pydantic (application) + database constraints (defense in depth)

**Specification Compliance**:
- ✅ User entity attributes (FR-057, FR-018)
- ✅ Todo entity attributes (FR-058, FR-016-FR-019)
- ✅ User-scoped data (FR-011-FR-015, FR-020)
- ✅ Referential integrity (FR-061)
- ✅ Data persistence (FR-057-FR-061)
- ✅ Timestamps for audit trail (spec entities definition)

**Constitutional Compliance**:
- ✅ Neon Serverless PostgreSQL (Phase II authorized)
- ✅ SQLModel ORM (Phase II authorized)
- ✅ Clean Architecture (domain models, no framework dependencies)
- ✅ Data isolation (user-scoped queries, ownership validation)

**Next Steps**:
1. Implement SQLModel models in `backend/src/models/`
2. Generate initial Alembic migration
3. Test schema on Neon branch
4. Apply migration to main database
5. Implement repository layer (data access)
