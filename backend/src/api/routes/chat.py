from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from src.core.database import get_session as get_db_session
from src.models.user import User
from src.api.middleware.auth import get_current_user
from src.services.conversation_service import ConversationService
from src.services.message_service import MessageService
from src.services.agent_service import AgentService
from src.mcp.server import MCPServer
from src.core.config import settings
from src.core.exceptions import AuthenticationError, ValidationError, NotFoundError

router = APIRouter()
mcp_server = MCPServer()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[int] = None


class ToolCallResult(BaseModel):
    tool: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: List[ToolCallResult]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    # Resolve user_id from authentication context
    user_id = current_user.id
    """
    Process a chat message from a user.
    Includes authentication, authorization, and agent execution.
    """
    # 1. Authentication is handled by get_current_user middleware (returns 401 if not authenticated)

    # 2. Authorization is implicit: user_id comes from authenticated user context
    # No need to check if user_id matches current_user.id since they are the same

    try:
        conversation_service = ConversationService(session)
        message_service = MessageService(session)

        # 3. Get or create conversation (handles 404 internally if needed or creates one)
        conversation = await conversation_service.get_or_create_conversation(
            chat_request.conversation_id,
            user_id
        )

        # 4. Store user message
        await message_service.store_message(
            conversation_id=conversation.id,
            user_id=user_id,
            role="user",
            content=chat_request.message
        )

        # 5. Get recent history for context
        history = await message_service.get_recent_history(
            conversation_id=conversation.id,
            limit=settings.MAX_CONVERSATION_HISTORY
        )

        history_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in history[:-1]
        ]

        # 6. Execute Agent (LLM + MCP Tools)
        agent_service = AgentService(session, mcp_server)
        result = await agent_service.execute(
            user_id=user_id,
            history=history_messages,
            message=chat_request.message
        )

        # 7. Store assistant response
        await message_service.store_message(
            conversation_id=conversation.id,
            user_id=user_id,
            role="assistant",
            content=result["response"]
        )

        await session.commit()

        return ChatResponse(
            conversation_id=conversation.id,
            response=result["response"],
            tool_calls=[ToolCallResult(**tc) for tc in result["tool_calls"]]
        )

    except (AuthenticationError, ValidationError, NotFoundError) as e:
        await session.rollback()
        # These are handled by middleware in error.py, but we re-raise for clarity
        raise e
    except Exception as e:
        await session.rollback()
        # Log unexpected errors to console/log
        print(f"Chat API Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat request: {str(e)}"
        )
