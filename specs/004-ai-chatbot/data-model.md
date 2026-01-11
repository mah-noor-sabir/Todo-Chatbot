# Data Model: Todo AI Chatbot

**Feature**: 004-ai-chatbot
**Date**: 2026-01-02
**Purpose**: Entity definitions for conversation and message persistence

This document defines the database entities required for Phase IV AI Chatbot. These entities extend the existing Phase II schema (users, todos).

## Entity Definitions

### 1. Conversation

Represents a chat session between a user and the AI assistant. Each conversation contains a sequence of messages.

**Table Name**: `conversations`

**Fields**:
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): Unique conversation identifier
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY → users.id): Owner of the conversation
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): When conversation started
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Last message timestamp

**Relationships**:
- `user_id` → users(id) ON DELETE CASCADE
- One conversation has many messages (1:N)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for listing user's conversations)

**Constraints**:
- `user_id` REFERENCES users(id) ON DELETE CASCADE
- Cascade delete ensures conversation deleted when user deleted

**SQLModel Definition**:
```python
from sqlmodel import Field, Relationship
from src.models.base import TimestampModel

class Conversation(TimestampModel, table=True):
    __tablename__ = "conversations"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

---

### 2. Message

Represents a single message in a conversation (either from user or assistant).

**Table Name**: `messages`

**Fields**:
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): Unique message identifier
- `conversation_id` (INTEGER, NOT NULL, FOREIGN KEY → conversations.id): Parent conversation
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY → users.id): Owner (denormalized for queries)
- `role` (VARCHAR(20), NOT NULL, CHECK IN ('user', 'assistant')): Message sender
- `content` (TEXT, NOT NULL): Message text content
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): When message was sent

**Relationships**:
- `conversation_id` → conversations(id) ON DELETE CASCADE
- `user_id` → users(id) ON DELETE CASCADE

**Indexes**:
- PRIMARY KEY on `id`
- COMPOSITE INDEX on `(conversation_id, created_at DESC)` (for history retrieval)
- INDEX on `user_id` (for user message searches)

**Constraints**:
- `conversation_id` REFERENCES conversations(id) ON DELETE CASCADE
- `user_id` REFERENCES users(id) ON DELETE CASCADE
- `role` CHECK (role IN ('user', 'assistant'))
- Cascade delete ensures messages deleted when conversation deleted

**SQLModel Definition**:
```python
from sqlmodel import Field, Relationship
from datetime import datetime
from typing import Literal

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    role: Literal["user", "assistant"] = Field(nullable=False)
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="messages")
```

---

## Entity Relationships Diagram

```
┌─────────────┐
│    users    │ (Existing from Phase II)
│             │
│ id (PK)     │
│ email       │
│ password_hash│
└──────┬──────┘
       │
       │ 1:N (user_id FK)
       │
       ├──────────────────────────────┐
       │                              │
       v                              v
┌──────────────┐              ┌─────────────┐
│conversations │              │    todos    │ (Existing from Phase II)
│              │              │             │
│ id (PK)      │              │ id (PK)     │
│ user_id (FK) │              │ user_id (FK)│
│ created_at   │              │ title       │
│ updated_at   │              │ completed   │
└──────┬───────┘              └─────────────┘
       │
       │ 1:N (conversation_id FK)
       │
       v
┌──────────────┐
│   messages   │
│              │
│ id (PK)      │
│ conversation_id (FK)
│ user_id (FK) │ (denormalized)
│ role         │ ('user' | 'assistant')
│ content      │ (TEXT)
│ created_at   │
└──────────────┘
```

---

## Database Migration

**Migration File**: `backend/migrations/versions/c4d5e6f7g8h9_add_conversations_messages.py`

**Upgrade Operations**:
```sql
-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_user_id ON messages(user_id);
```

**Downgrade Operations**:
```sql
DROP INDEX IF EXISTS idx_messages_user_id;
DROP INDEX IF EXISTS idx_messages_conversation_created;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP TABLE IF EXISTS messages;

DROP INDEX IF EXISTS idx_conversations_user_id;
DROP TABLE IF EXISTS conversations;
```

---

## Update to User Model

**File**: `backend/src/models/user.py`

Add relationships to User model:
```python
class User(TimestampModel, table=True):
    # ... existing fields ...

    # Relationships
    todos: list["Todo"] = Relationship(back_populates="user")  # Existing
    conversations: list["Conversation"] = Relationship(back_populates="user")  # NEW
    messages: list["Message"] = Relationship(back_populates="user")  # NEW
```

---

## Query Patterns

### Fetch Recent Conversation History
```python
async def get_recent_history(session: AsyncSession, conversation_id: int, limit: int = 50):
    query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(query)
    messages = result.scalars().all()
    return list(reversed(messages))  # Return in chronological order
```

### List User Conversations
```python
async def list_user_conversations(session: AsyncSession, user_id: int):
    query = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    result = await session.execute(query)
    return result.scalars().all()
```

### Create Conversation
```python
async def create_conversation(session: AsyncSession, user_id: int):
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    await session.flush()  # Get ID without committing
    return conversation
```

### Store Message
```python
async def store_message(session: AsyncSession, conversation_id: int, user_id: int, role: str, content: str):
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )
    session.add(message)
    await session.flush()
    return message
```

---

## Storage Estimates

**Assumptions**:
- Average message length: 100 characters
- Typical conversation: 20 messages (10 user + 10 assistant)
- Active users: 100 users/day
- Conversation frequency: 3 conversations/user/day

**Daily Storage**:
- Messages per day: 100 users × 3 conversations × 20 messages = 6,000 messages
- Storage per message: ~150 bytes (100 chars + metadata)
- Daily storage: 6,000 × 150 bytes = 900KB/day = ~27MB/month

**Annual Storage**:
- 12 months × 27MB = 324MB/year (negligible for PostgreSQL)

**Index Overhead**:
- Each index: ~40 bytes/row
- 4 indexes × 6,000 messages/day = 240KB/day
- Total with indexes: ~1.1MB/day = 33MB/month

**Conclusion**: Storage requirements are minimal for Phase IV scope. Database will not require partitioning or archival strategies.

---

## Constitutional Compliance

### Rule 1: Stateless Backend Architecture
✅ All conversation state stored in database
✅ No in-memory conversation cache

### Rule 5: Chat API Persistence Requirements
✅ Conversation and Message tables persist all chat data
✅ History fetched from database on every request

### Rule 10: Server Restart Resilience
✅ All conversation history survives restarts
✅ Cascade deletes maintain referential integrity

---

## Validation Checklist

- [ ] Migration creates conversations and messages tables
- [ ] Foreign keys enforce referential integrity
- [ ] Indexes optimize history retrieval query
- [ ] Cascade deletes work correctly (test with user deletion)
- [ ] SQLModel definitions match migration schema
- [ ] Query patterns tested with 50+ message conversations
- [ ] Storage estimates validated with load testing

---

## References

- Specification: `specs/004-ai-chatbot/spec.md` (Key Entities section)
- Research: `specs/004-ai-chatbot/research.md` (R0.3: Conversation History Management)
- Plan: `specs/004-ai-chatbot/plan.md` (Project Structure section)
