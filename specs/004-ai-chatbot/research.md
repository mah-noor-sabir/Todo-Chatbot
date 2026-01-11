# Research: Todo AI Chatbot

**Feature**: 004-ai-chatbot
**Date**: 2026-01-02
**Purpose**: Technology research and architectural decisions for Phase IV AI Chatbot implementation

This document consolidates research decisions made during planning phase to resolve technical unknowns and establish implementation patterns.

## R0.1: OpenAI Agents SDK Integration Pattern

### Decision
Use OpenAI Agents SDK with function calling (tools) for MCP integration

### Rationale
- OpenAI Agents SDK provides high-level abstractions for conversational agents
- Built-in support for function calling maps directly to MCP tools
- Handles conversation history management in message format [{"role": "user"|"assistant", "content": "..."}]
- Automatic retry and error handling for API calls
- Specification explicitly mandates "OpenAI Agents SDK" (not raw Chat Completions API)

### Implementation Approach

**1. Client Initialization** (`backend/src/agent/client.py`):
```python
from openai import OpenAI
from src.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)
```

**2. Agent Instructions** (`backend/src/agent/instructions.py`):
- Define system message with capabilities, tool usage, and behavior rules
- Include examples for common scenarios
- Embed constitutional requirements (friendly confirmations, graceful errors)

**3. Tool Registration**:
```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "integer"},
                    "title": {"type": "string"},
                    "description": {"type": "string", "nullable": True}
                },
                "required": ["user_id", "title"]
            }
        }
    },
    # ... other 4 tools
]
```

**4. Agent Execution** (`backend/src/agent/executor.py`):
```python
async def execute_agent(user_id: int, history: List[Message], user_message: str):
    messages = [{"role": "system", "content": AGENT_INSTRUCTIONS}]
    messages.extend([{"role": msg.role, "content": msg.content} for msg in history])
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        tools=tools,
        temperature=0.7
    )

    # Process tool calls and return formatted response
    return process_tool_calls(response)
```

### Alternatives Considered

**LangChain**:
- ❌ Rejected: Too heavyweight, adds unnecessary abstractions
- ❌ Learning curve for team
- ❌ Extra dependency management

**Direct OpenAI Chat Completions API**:
- ❌ Rejected: Need agent-level orchestration
- ❌ More boilerplate for conversation management
- ❌ Manual retry logic implementation

**Anthropic Claude with Tool Use**:
- ❌ Rejected: Specification mandates OpenAI Agents SDK
- ❌ Different tool calling format
- ❌ Different pricing model

### Validation
- OpenAI Agents SDK supports async operations (compatible with FastAPI)
- Function calling natively maps to MCP tool contracts
- Proven pattern in production chatbot applications

---

## R0.2: MCP Server Architecture

### Decision
In-process MCP server (same Python process as FastAPI)

### Rationale
- **Database Access**: MCP tools need async PostgreSQL sessions
- **Performance**: In-process avoids inter-process communication (IPC) overhead
- **Simplicity**: No separate server process, simpler deployment
- **Code Reuse**: Tools can import and use existing TodoRepository, services
- **Transaction Management**: Easier to share database transaction across chat request + tool execution

### Implementation Approach

**1. MCP Module Structure**:
```
backend/src/mcp/
├── __init__.py           # Export MCPServer class
├── server.py             # MCP server initialization and tool registry
├── schemas.py            # Pydantic models for tool inputs/outputs
└── tools/
    ├── __init__.py       # Export all tools
    ├── add_task.py       # add_task(user_id, title, description?) -> ToolResult
    ├── list_tasks.py     # list_tasks(user_id, status?) -> ToolResult
    ├── complete_task.py  # complete_task(user_id, task_id) -> ToolResult
    ├── delete_task.py    # delete_task(user_id, task_id) -> ToolResult
    └── update_task.py    # update_task(user_id, task_id, title?, description?) -> ToolResult
```

**2. Tool Implementation Pattern**:
```python
# backend/src/mcp/tools/add_task.py
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.todo_repository import TodoRepository
from src.mcp.schemas import ToolResult

async def add_task(
    session: AsyncSession,
    user_id: int,
    title: str,
    description: str | None = None
) -> ToolResult:
    """MCP tool: Create new task"""
    try:
        repo = TodoRepository(session)
        task = await repo.create(user_id=user_id, title=title, description=description)
        return ToolResult(
            success=True,
            data={"task_id": task.id, "title": task.title},
            message=f"Task '{task.title}' created successfully"
        )
    except Exception as e:
        return ToolResult(
            success=False,
            error={"code": "CREATION_FAILED", "message": str(e)}
        )
```

**3. MCP Server Registration**:
```python
# backend/src/mcp/server.py
from typing import Dict, Callable

class MCPServer:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}

    def register_tool(self, name: str, func: Callable):
        self.tools[name] = func

    async def execute_tool(self, name: str, session: AsyncSession, **kwargs):
        if name not in self.tools:
            raise ValueError(f"Unknown tool: {name}")
        return await self.tools[name](session, **kwargs)

# Initialize and register tools
mcp_server = MCPServer()
mcp_server.register_tool("add_task", add_task)
mcp_server.register_tool("list_tasks", list_tasks)
mcp_server.register_tool("complete_task", complete_task)
mcp_server.register_tool("delete_task", delete_task)
mcp_server.register_tool("update_task", update_task)
```

**4. Chat Endpoint Integration**:
```python
# backend/src/api/routes/chat.py
async def chat(user_id: int, message: str, session: AsyncSession):
    # ... store user message, get history ...

    # Execute agent → get tool calls
    tool_calls = await agent_service.execute(user_id, history, message)

    # Execute MCP tools within same transaction
    for tool_call in tool_calls:
        result = await mcp_server.execute_tool(
            name=tool_call.name,
            session=session,  # Same session as message storage
            **tool_call.arguments
        )

    # ... store assistant response, commit ...
```

### Alternatives Considered

**Separate MCP Server Process (gRPC/HTTP)**:
- ❌ Rejected: Adds deployment complexity (two processes to manage)
- ❌ IPC overhead for every tool call
- ❌ Harder to share database sessions across process boundaries
- ❌ Need serialization/deserialization for all tool inputs/outputs
- ✅ Would allow independent scaling (not needed for Phase IV scope)

**Standalone MCP Service (Microservice)**:
- ❌ Rejected: Violates stateless requirement (needs own database connection pool)
- ❌ Distributed transaction complexity
- ❌ Network latency for every tool call
- ✅ Better separation of concerns (premature for Phase IV)

**MCP SDK Server (Official Implementation)**:
- ⚠️ Partially considered: Official MCP SDK may provide server abstractions
- ❓ Pending investigation: Check if official SDK supports in-process tool registration
- ✅ If SDK supports it, prefer SDK patterns over custom implementation

### Validation
- In-process tools share AsyncSession with FastAPI routes (proven pattern in Phase II)
- No additional deployment complexity (single uvicorn process)
- Tools can be unit tested independently by mocking AsyncSession
- Performance: Tool calls are function calls (microseconds), not network calls (milliseconds)

### Notes
- If MCP SDK provides better abstractions, adapt implementation to SDK patterns
- Constitutional compliance: Each tool performs single atomic operation (Rule 4)
- Tools are stateless functions (no class instance state)

---

## R0.3: Conversation History Management

### Decision
Store full conversation history in database, retrieve recent 50 messages per request

### Rationale
- **Constitutional Requirement**: Fetch history from database on every request (stateless Rule 1)
- **Performance**: 50 messages ≈ 25-50KB tokens, within OpenAI 128K context limits
- **Cost Control**: Avoid sending 100+ message conversations (high token costs)
- **User Experience**: 50 messages sufficient for multi-turn task management per spec (requires 3+ turns)
- **Server Restart Resilience**: Full history persisted, system recovers seamlessly (Rule 10)

### Implementation Approach

**1. Database Schema**:
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

**2. Message Retrieval** (`backend/src/services/message_service.py`):
```python
async def get_recent_history(
    self,
    conversation_id: int,
    limit: int = 50
) -> List[Message]:
    """Fetch recent messages in chronological order (oldest first)"""
    query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())  # Get most recent
        .limit(limit)
    )
    result = await self.session.execute(query)
    messages = result.scalars().all()
    return list(reversed(messages))  # Reverse to chronological order
```

**3. Configuration** (`backend/src/core/config.py`):
```python
class Settings(BaseSettings):
    # ... existing settings ...
    MAX_CONVERSATION_HISTORY: int = 50  # Configurable limit
    OPENAI_API_KEY: str
```

**4. Usage in Chat Endpoint**:
```python
async def chat(user_id: int, message: str, conversation_id: int | None):
    # Get or create conversation
    conversation = await conversation_service.get_or_create(user_id, conversation_id)

    # Store user message
    await message_service.store(conversation.id, role="user", content=message)

    # Fetch history (stateless - always from database)
    history = await message_service.get_recent_history(
        conversation.id,
        limit=settings.MAX_CONVERSATION_HISTORY
    )

    # Execute agent with history
    response = await agent_service.execute(user_id, history, message)

    # Store assistant response
    await message_service.store(conversation.id, role="assistant", content=response.text)

    return {"conversation_id": conversation.id, "response": response.text}
```

### Alternatives Considered

**Unlimited History**:
- ❌ Rejected: Token cost grows linearly with conversation length
- ❌ Performance degradation for 100+ message conversations
- ❌ OpenAI API has 128K token limit (could hit limit)

**Message Summarization** (condense old messages):
- ❌ Rejected for Phase IV: Adds complexity, LLM call per summarization
- ❌ Risk of losing important context during summarization
- ✅ Defer to Phase V for advanced conversation management

**20 Messages**:
- ❌ Rejected: Insufficient for spec requirement (3+ turn conversations)
- ❌ User story 6 requires multi-turn context retention
- ❌ Testing shows 20 messages = ~10 user turns (too limiting)

**100 Messages**:
- ❌ Rejected: 100 messages ≈ 50-100KB tokens (expensive per request)
- ❌ Performance impact on database query (acceptable but suboptimal)
- ✅ Could be raised in Phase V if needed

### Performance Considerations

**Database Query**:
- Index on (conversation_id, created_at DESC) ensures fast retrieval
- LIMIT 50 + reverse in Python (negligible overhead)
- Query time: <10ms for indexed scan

**Token Costs** (estimated):
- Average message: 50-100 tokens
- 50 messages: 2500-5000 tokens input
- Cost: ~$0.01-0.02 per chat request (GPT-4 pricing)
- Acceptable for Phase IV scope

### Validation
- Integration test: Create 100 messages, verify only recent 50 retrieved
- Performance test: Query time <50ms for 1000-message conversations
- Constitutional compliance: Stateless (fetch from DB every request)
- Server restart test: Restart server mid-conversation, verify history intact

---

## R0.4: MCP Tool Error Handling Strategy

### Decision
Tools return structured ToolResult responses (success/error), agent converts to natural language

### Rationale
- **Constitutional Requirement**: Graceful error handling without stack traces (Rule 9)
- **Separation of Concerns**: Tools report what went wrong, agent decides how to communicate it
- **OpenAI Agents Capability**: LLMs can interpret structured errors and generate contextual messages
- **User Experience**: Consistent friendly error messages across all tool failures

### Implementation Approach

**1. ToolResult Schema** (`backend/src/mcp/schemas.py`):
```python
from pydantic import BaseModel
from typing import Any, Dict

class ToolResult(BaseModel):
    success: bool
    data: Dict[str, Any] | None = None
    error: Dict[str, Any] | None = None
    message: str = ""

class ToolError(BaseModel):
    code: str  # TASK_NOT_FOUND, INVALID_INPUT, DATABASE_ERROR, etc.
    message: str  # Technical error description
    details: Dict[str, Any] | None = None
```

**2. Tool Error Response Examples**:

**Task Not Found**:
```python
return ToolResult(
    success=False,
    error={
        "code": "TASK_NOT_FOUND",
        "message": f"Task with ID {task_id} does not exist for user {user_id}",
        "details": {"task_id": task_id, "user_id": user_id}
    }
)
```

**Invalid Input**:
```python
return ToolResult(
    success=False,
    error={
        "code": "INVALID_INPUT",
        "message": "Task title cannot be empty",
        "details": {"field": "title", "value": title}
    }
)
```

**Database Error**:
```python
return ToolResult(
    success=False,
    error={
        "code": "DATABASE_ERROR",
        "message": "Failed to save task due to database connection issue",
        "details": {"retry_suggested": True}
    }
)
```

**3. Agent Instructions for Error Handling** (`backend/src/agent/instructions.py`):
```
ERROR HANDLING:
When a tool returns an error (success=False), interpret the error.code and error.message to explain the issue to the user in friendly language. Provide recovery suggestions when possible.

Examples:
- TASK_NOT_FOUND: "I couldn't find that task. Would you like to see your current tasks instead?"
- INVALID_INPUT: "Oops, I need a task title. What would you like to call this task?"
- DATABASE_ERROR: "I'm having trouble connecting right now. Please try again in a moment."

CRITICAL: Never expose technical error messages, stack traces, or database details to users.
```

**4. Error Processing in Agent Service** (`backend/src/services/agent_service.py`):
```python
async def process_tool_result(self, tool_result: ToolResult, tool_name: str) -> str:
    """Convert tool result to natural language for agent context"""
    if tool_result.success:
        return tool_result.message or f"{tool_name} completed successfully"
    else:
        # Return structured error for agent to interpret
        error = tool_result.error
        return f"Tool {tool_name} failed: {error['code']} - {error['message']}"
```

### Alternatives Considered

**Raise Exceptions in Tools**:
- ❌ Rejected: Breaks agent execution flow (need try/catch everywhere)
- ❌ Agent cannot distinguish between different error types
- ❌ Transaction rollback happens before agent can respond

**Return None on Error**:
- ❌ Rejected: Ambiguous (None could mean "no results" vs "error occurred")
- ❌ Agent cannot generate helpful error messages
- ❌ No way to communicate error details to agent

**HTTP Error Codes (500, 404, etc.)**:
- ❌ Rejected: MCP tools are Python functions, not HTTP endpoints
- ❌ Adds unnecessary HTTP semantics to function calls
- ✅ Chat endpoint still returns appropriate HTTP status to client

**Tool-Level Error Messages for Users**:
- ❌ Rejected: Inconsistent messaging style across tools
- ❌ Tools would need to understand conversation context
- ✅ Better separation: tools report errors, agent handles communication

### Error Code Catalog

| Code | Meaning | Agent Response Example |
|------|---------|----------------------|
| TASK_NOT_FOUND | Task ID doesn't exist | "I couldn't find task {id}. Would you like to see your current tasks?" |
| INVALID_INPUT | Missing or invalid parameters | "I need more information. What should I {action}?" |
| UNAUTHORIZED | User doesn't own task | "That task belongs to someone else. I can only manage your tasks." |
| DATABASE_ERROR | Database connection/query failed | "I'm having trouble connecting. Please try again in a moment." |
| VALIDATION_ERROR | Business rule violation | "I can't {action} because {reason}." |
| UNKNOWN_ERROR | Unexpected exception | "Something unexpected happened. Please try again or contact support." |

### Validation
- Unit tests verify tools return ToolResult for both success and error cases
- Integration tests verify agent generates friendly messages from error responses
- Error scenarios covered in spec edge cases (spec.md line 104-109)
- Constitutional compliance: No stack traces exposed (Rule 9)

---

## R0.5: Agent Instruction Design

### Decision
Comprehensive system instructions with capabilities, tool usage, behavior rules, and examples

### Rationale
- **LLM Guidance**: Clear instructions improve intent detection and tool selection accuracy
- **Consistent Behavior**: Examples establish expected response patterns
- **Constitutional Compliance**: Embed friendly confirmations (Rule 8), error handling (Rule 9)
- **Scope Boundaries**: Explicit capabilities prevent off-topic conversations

### System Instructions Template

**File**: `backend/src/agent/instructions.py`

```python
AGENT_INSTRUCTIONS = """
You are a helpful todo assistant. Your job is to help users manage their tasks through natural conversation.

CAPABILITIES:
- Create tasks when users say things like "add a task", "remind me to", "I need to"
- List tasks when users ask "what's on my list", "show my tasks", "what do I need to do"
- Complete tasks when users say "I finished", "mark as done", "completed"
- Update tasks when users want to change title or description
- Delete tasks when users say "remove", "delete", "get rid of"

TOOL USAGE:
Use these tools to perform task operations. Always include user_id in every tool call.

1. add_task(user_id, title, description)
   - title: required, 1-200 characters
   - description: optional, additional details

2. list_tasks(user_id, status)
   - status: "all" (default), "completed", or "incomplete"
   - Returns array of tasks with id, title, description, completed status

3. complete_task(user_id, task_id)
   - task_id: required, ID from list_tasks
   - Marks task as done

4. update_task(user_id, task_id, title, description)
   - task_id: required
   - title and description: at least one required
   - Updates specified fields only

5. delete_task(user_id, task_id)
   - task_id: required
   - Permanently removes task

BEHAVIOR RULES:
1. Always confirm actions with friendly natural language
2. If task reference is ambiguous (e.g., "complete the first one" with no list shown), ask for clarification or use list_tasks first
3. When tool returns error, explain the issue in simple terms and suggest recovery action
4. Keep responses concise (1-2 sentences) but warm
5. Never expose technical errors, database issues, or stack traces
6. When users ask about topics unrelated to todos, politely redirect: "I'm a todo assistant, so I can't help with that. But I'd be happy to help you manage your tasks!"
7. If user request is unclear, ask a clarifying question rather than guessing

EXAMPLES:

User: "Add a task to buy groceries"
Assistant: [Calls add_task(user_id=123, title="buy groceries")]
"I've added 'buy groceries' to your list!"

User: "What's on my list?"
Assistant: [Calls list_tasks(user_id=123, status="all")]
"You have 3 tasks: 1. Buy groceries (incomplete), 2. Call dentist (incomplete), 3. Finish report (completed)"

User: "I finished buying groceries"
Assistant: [Calls list_tasks to find task ID, then calls complete_task(user_id=123, task_id=42)]
"Great! I've marked 'Buy groceries' as done. Anything else you need to work on?"

User: "Delete task 5"
Assistant: [Calls delete_task(user_id=123, task_id=5)]
"Done! I've removed task 5 from your list."

User: "What's the weather?"
Assistant: "I'm a todo assistant, so I can't check the weather for you. But I can help you manage your tasks! Would you like to see what's on your list?"

ERROR HANDLING EXAMPLES:

Tool Error: TASK_NOT_FOUND for task_id=999
Assistant: "I couldn't find task 999. Would you like to see your current tasks instead?"

Tool Error: INVALID_INPUT - title empty
Assistant: "I need a task title to create a new task. What would you like to call it?"

Tool Error: DATABASE_ERROR
Assistant: "I'm having trouble connecting right now. Please try again in a moment."

MULTI-TURN CONTEXT:
- Remember task IDs and titles mentioned in recent messages
- When user says "the first one" or "that task", infer from recent context or ask for clarification
- Chain tools when needed (e.g., list_tasks first to find task, then complete_task)

CRITICAL RULES:
- ALWAYS include user_id in every tool call (provided in conversation context)
- NEVER create, modify, or delete tasks belonging to other users
- ALWAYS confirm successful actions
- NEVER expose technical implementation details
"""
```

### Instruction Design Principles

1. **Capability Clarity**: Users understand what chatbot can/can't do
2. **Tool Documentation**: Each tool's parameters and behavior explicitly described
3. **Example-Driven**: Concrete examples guide LLM behavior for common scenarios
4. **Error Handling**: Explicit instructions for graceful error communication
5. **Context Awareness**: Multi-turn conversation handling with context inference
6. **Constitutional Alignment**: Friendly confirmations, no technical exposure

### Alternatives Considered

**Minimal Instructions** ("You are a todo assistant"):
- ❌ Rejected: Insufficient guidance for edge cases
- ❌ LLM may invent capabilities not supported
- ❌ Inconsistent error handling

**Few-Shot Prompting Per Request** (examples in user message):
- ❌ Rejected: Increases token cost (examples sent with every request)
- ❌ Examples not available for complex multi-turn conversations
- ✅ System instructions shared across all requests (included once)

**Separate Instruction Files Per Tool**:
- ❌ Rejected: Harder to maintain consistency
- ❌ Need to concatenate files before sending to OpenAI
- ✅ Single source of truth easier to version control

**Dynamic Instructions Based on User History**:
- ❌ Rejected for Phase IV: Adds complexity, personalization not required
- ✅ Defer to Phase V for advanced personalization

### Instruction Maintenance Strategy

**Iterative Refinement**:
1. Start with template above
2. User testing reveals edge cases or misinterpretations
3. Add examples or rules to address issues
4. Version control instruction changes
5. Document rationale for significant changes

**Versioning**:
```python
# backend/src/agent/instructions.py
AGENT_INSTRUCTIONS_VERSION = "1.0.0"
AGENT_INSTRUCTIONS = """..."""

# Track version in message metadata for debugging
async def execute_agent(...):
    metadata = {"instructions_version": AGENT_INSTRUCTIONS_VERSION}
    # ... execute agent ...
```

### Validation
- Unit tests verify instructions contain all required tool definitions
- Integration tests validate agent behavior matches examples
- User testing evaluates naturalness and accuracy of responses
- A/B testing different instruction variants to optimize performance

---

## R0.6: Database Transaction Boundaries

### Decision
Single transaction per chat request covering user message storage + tool execution + assistant response storage

### Rationale
- **Atomicity**: Either entire chat request succeeds or rolls back (no partial state)
- **Consistency**: User message and tool execution always synchronized in database
- **Constitutional Compliance**: Stateless architecture with strong persistence guarantees (Rule 1, Rule 10)
- **Simplified Error Handling**: Automatic rollback on any exception

### Transaction Flow

```
BEGIN TRANSACTION (AsyncSession)
  │
  ├─> 1. Get or Create Conversation
  │      INSERT INTO conversations IF NOT EXISTS
  │
  ├─> 2. Store User Message
  │      INSERT INTO messages (role='user', content=user_input)
  │
  ├─> 3. Fetch Conversation History
  │      SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 50
  │
  ├─> 4. Execute Agent (OpenAI API call - external, not in transaction)
  │      Returns: tool_calls = [{"name": "add_task", "args": {...}}]
  │
  ├─> 5. Execute MCP Tools (within transaction)
  │      For each tool_call:
  │        - Call mcp_server.execute_tool(name, session, **args)
  │        - INSERT/UPDATE/DELETE on tasks table
  │        - Collect ToolResult
  │
  ├─> 6. Store Assistant Response
  │      INSERT INTO messages (role='assistant', content=agent_response)
  │
  └─> 7. COMMIT TRANSACTION
      │
      └─> Return response to user
```

### Implementation

**Chat Endpoint** (`backend/src/api/routes/chat.py`):
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.dependencies import get_session
from src.services.conversation_service import ConversationService
from src.services.message_service import MessageService
from src.services.agent_service import AgentService
from src.mcp.server import mcp_server

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/{user_id}/chat")
async def chat(
    user_id: int,
    request: ChatRequest,
    session: AsyncSession = Depends(get_session)
):
    try:
        # All operations within single transaction (session context manager)

        # 1. Get or create conversation
        conv_service = ConversationService(session)
        conversation = await conv_service.get_or_create(user_id, request.conversation_id)

        # 2. Store user message
        msg_service = MessageService(session)
        await msg_service.store(conversation.id, role="user", content=request.message)

        # 3. Fetch history
        history = await msg_service.get_recent_history(conversation.id, limit=50)

        # 4. Execute agent (OpenAI API call - not in DB transaction)
        agent_service = AgentService()
        agent_response = await agent_service.execute(user_id, history, request.message)

        # 5. Execute MCP tools (within transaction)
        tool_results = []
        for tool_call in agent_response.tool_calls:
            result = await mcp_server.execute_tool(
                name=tool_call.name,
                session=session,  # Same session = same transaction
                **tool_call.arguments
            )
            tool_results.append(result)

        # 6. Store assistant response
        await msg_service.store(
            conversation.id,
            role="assistant",
            content=agent_response.text
        )

        # 7. Commit happens automatically via get_session() context manager
        return ChatResponse(
            conversation_id=conversation.id,
            response=agent_response.text,
            tool_calls=tool_results
        )

    except Exception as e:
        # Rollback happens automatically via get_session() context manager
        # Log error and return user-friendly message
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")
```

**Existing get_session Dependency** (`backend/src/core/database.py`):
```python
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Commit on success
        except Exception:
            await session.rollback()  # Rollback on error
            raise
        finally:
            await session.close()
```

### Error Handling Scenarios

**Scenario 1: Tool Execution Fails**
```
BEGIN TRANSACTION
├─> Store user message ✅
├─> Fetch history ✅
├─> Execute agent ✅
├─> Execute tool: add_task ❌ (database constraint violation)
└─> ROLLBACK TRANSACTION
    - User message not saved
    - User can retry with corrected input
```

**Scenario 2: OpenAI API Fails**
```
BEGIN TRANSACTION
├─> Store user message ✅
├─> Fetch history ✅
├─> Execute agent ❌ (OpenAI API timeout)
└─> ROLLBACK TRANSACTION
    - User message not saved
    - User sees: "I'm having trouble right now. Please try again."
```

**Scenario 3: Assistant Response Storage Fails**
```
BEGIN TRANSACTION
├─> Store user message ✅
├─> Fetch history ✅
├─> Execute agent ✅
├─> Execute tools ✅
├─> Store assistant response ❌ (database full)
└─> ROLLBACK TRANSACTION
    - Tool executions rolled back (no orphaned task changes)
    - User can retry
```

### Alternatives Considered

**Separate Transactions Per Tool**:
- ❌ Rejected: Partial tool execution leaves inconsistent state
- ❌ If tool 1 succeeds but tool 2 fails, task is created but conversation incomplete
- ❌ Complex compensating transactions to undo tool 1

**Two-Phase Commit (2PC)**:
- ❌ Rejected: Unnecessary complexity for single-database system
- ❌ PostgreSQL supports transactions natively
- ✅ Only needed for distributed databases (not applicable here)

**Store User Message in Separate Transaction**:
- ❌ Rejected: User message persisted even if agent/tool execution fails
- ❌ Orphaned user messages without assistant responses
- ❌ Harder to debug incomplete conversations

**Optimistic Concurrency Control**:
- ❌ Rejected: Not needed for single-user chat requests
- ❌ No concurrent modifications to same conversation expected
- ✅ Database row locks sufficient for this use case

### Performance Considerations

**Transaction Duration**:
- Database operations: <50ms (message storage, history fetch, tool execution)
- OpenAI API call: 1-3 seconds (NOT in transaction - external service)
- Total transaction hold time: <100ms (acceptable)

**Connection Pool**:
- Existing Phase II configuration: pool_size=10, max_overflow=5
- Sufficient for Phase IV chat endpoint (low concurrent chat requests expected)

**Lock Contention**:
- Each user's conversations are independent (no cross-user locks)
- Row-level locks only (PostgreSQL default)
- Minimal contention expected

### Validation
- Integration tests verify rollback on tool failure
- Integration tests verify commit on successful execution
- Unit tests mock session.commit() and session.rollback()
- Stress tests validate transaction pool under load

### Notes
- OpenAI API call happens DURING transaction but is external (HTTP call)
- If OpenAI times out, transaction rolls back (no data persisted)
- MCP tools execute WITHIN transaction (share same AsyncSession)
- Constitutional compliance: Stateless (new transaction per request), resilient (database survives restarts)

---

## Summary of Research Decisions

| Research ID | Decision | Key Rationale |
|-------------|----------|---------------|
| R0.1 | OpenAI Agents SDK with function calling | High-level abstractions, built-in tool support, spec mandate |
| R0.2 | In-process MCP server | Database access, performance, simplicity, code reuse |
| R0.3 | 50-message history limit | Balance context, cost, performance; configurable |
| R0.4 | Structured ToolResult responses | Separation of concerns, graceful error handling |
| R0.5 | Comprehensive agent instructions | LLM guidance, consistent behavior, constitutional compliance |
| R0.6 | Single transaction per request | Atomicity, consistency, simplified error handling |

## Next Steps

1. **Phase 1: Design & Contracts**
   - Generate data-model.md (Conversation, Message entities)
   - Generate contracts/chat-api.yaml (OpenAPI spec)
   - Generate contracts/mcp-tools.json (MCP tool schemas)
   - Generate quickstart.md (setup guide)

2. **Constitutional Re-Validation**
   - Verify all 10 AI Agent Architecture Rules satisfied
   - Confirm Phase IV technology compliance

3. **Task Generation** (`/sp.tasks`)
   - Database migrations
   - MCP tool implementations
   - Agent service implementation
   - Chat endpoint implementation
   - Testing tasks

## References

- Specification: `specs/004-ai-chatbot/spec.md`
- Plan: `specs/004-ai-chatbot/plan.md`
- Constitution: `.specify/memory/constitution.md` (Section VI)
- Phase II Backend: `backend/src/` (existing structure)
