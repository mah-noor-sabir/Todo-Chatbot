from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from src.repositories.message_repository import MessageRepository
from src.models.message import Message


class MessageService:
    def __init__(self, session: AsyncSession):
        self.repository = MessageRepository(session)

    async def store_message(
        self,
        conversation_id: int,
        user_id: int,
        role: Literal["user", "assistant"],
        content: str
    ) -> Message:
        return await self.repository.create(conversation_id, user_id, role, content)

    async def get_recent_history(self, conversation_id: int, limit: int = 50) -> list[Message]:
        return await self.repository.get_recent_history(conversation_id, limit)
