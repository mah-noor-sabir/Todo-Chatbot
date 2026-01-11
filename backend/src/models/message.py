from sqlmodel import SQLModel, Field, Column, Text, Relationship
from sqlalchemy import String
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.conversation import Conversation
    from src.models.user import User


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    role: str = Field(sa_column=Column(String, nullable=False))
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
    user: Optional["User"] = Relationship(back_populates="messages")
