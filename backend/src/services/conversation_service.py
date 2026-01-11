from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from src.repositories.conversation_repository import ConversationRepository
from src.models.conversation import Conversation


class ConversationService:
    def __init__(self, session: AsyncSession):
        self.repository = ConversationRepository(session)

    async def get_or_create_conversation(
        self,
        conversation_id: Optional[int],
        user_id: int
    ) -> Conversation:
        if conversation_id:
            conversation = await self.repository.get_by_id(conversation_id, user_id)
            if conversation:
                return conversation

        return await self.repository.create(user_id)
