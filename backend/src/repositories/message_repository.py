from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Literal

from src.models.message import Message


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        conversation_id: int,
        user_id: int,
        role: Literal["user", "assistant"],
        content: str
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content
        )
        self.session.add(message)
        await self.session.flush()
        return message

    async def get_recent_history(self, conversation_id: int, limit: int = 50) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(desc(Message.created_at))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        messages = list(result.scalars().all())
        return list(reversed(messages))
