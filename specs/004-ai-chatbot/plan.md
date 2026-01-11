# Implementation Plan: Todo AI Chatbot

**Branch**: `004-ai-chatbot` | **Date**: 2026-01-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-ai-chatbot/spec.md`

## Summary

Implement a conversational AI chatbot interface for todo management using OpenAI Agents SDK and Model Context Protocol (MCP). The system will accept natural language input, interpret user intent, execute task operations through stateless MCP tools, and maintain conversation history in the database. The backend remains completely stateless with all conversation context persisted to PostgreSQL.

**Key Technical Approach**:
- Extend existing Phase II FastAPI backend with chat endpoint
- Add Conversation and Message models to existing SQLModel schema
- Implement MCP server with 5 stateless tools (add/list/complete/delete/update tasks)
- Integrate OpenAI Agents SDK for natural language processing
- Store all conversation state in database (fetch history on every request)
- Return conversational responses with tool execution results

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109.0, SQLModel 0.0.14, OpenAI Agents SDK (latest), MCP SDK (official)
**Storage**: Neon Serverless PostgreSQL (existing from Phase II)
**Testing**: pytest 7.4.4, pytest-asyncio 0.23.3
**Target Platform**: Linux server / localhost (async FastAPI application)
**Project Type**: Web (backend-only, extends Phase II backend/)
**Performance Goals**:
- <3 seconds for task creation via chat
- <2 seconds for task queries
- Support 50+ message conversation histories without degradation
**Constraints**:
- Stateless backend (no in-memory conversation cache)
- Agent cannot directly access database
- All task operations through MCP tools only
- Conversation history limited to recent 50 messages to control token costs
**Scale/Scope**:
- Single-user conversations (no multi-user chat)
- Phase IV scope only (AI chatbot, no collaboration features from Phase III)
- Backend implementation only (OpenAI ChatKit frontend out of scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase IV Technology Compliance

✅ **Phase IV Authorized Technologies**:
- OpenAI Agents SDK ✅ (authorized for Phase IV)
- MCP (Model Context Protocol) ✅ (authorized for Phase IV)
- FastAPI ✅ (extends Phase II backend)
- SQLModel ✅ (extends Phase II ORM)
- Neon PostgreSQL ✅ (existing from Phase II)

❌ **Prohibited for Phase IV**:
- Dapr runtime (deferred to Phase V) ❌
- Enterprise integrations (deferred to Phase V) ❌
- Real-time collaboration features (deferred to Phase III) ❌

**Result**: PASS - All proposed technologies are authorized for Phase IV

### Section VI AI Agent Architecture Rules Compliance

✅ **Rule 1: Stateless Backend Architecture**
- Fetch conversation history from database on every request
- Store user and assistant messages immediately
- No global state or conversation caching

✅ **Rule 2: AI Agent Access Restrictions**
- Agent code cannot import database modules
- Agent receives conversation history as input parameter
- Agent returns tool calls to be executed by API layer

✅ **Rule 3: MCP Tool Mandatory Interface**
- All 5 task operations implemented as MCP tools
- add_task, list_tasks, complete_task, delete_task, update_task
- No direct task operations allowed in agent code

✅ **Rule 4: Stateless MCP Tool Design**
- Each tool performs single atomic database operation
- Tools accept all required parameters (user_id, task_id, etc.)
- No cached tool state between invocations

✅ **Rule 5: Chat API Persistence Requirements**
- POST /api/{user_id}/chat endpoint
- Fetches conversation history before agent execution
- Stores user message → runs agent → stores assistant response
- Returns conversation_id, response text, and tool_calls array

✅ **Rule 6: Natural Language Intent Mapping**
- OpenAI Agents SDK handles intent detection
- No hardcoded command parsing or regex patterns
- Agent instructions guide LLM to map intents to MCP tool calls

✅ **Rule 7: Specification Adherence**
- MCP tools match spec contracts exactly (spec.md FR-001 through FR-020)
- Database models match spec entities (Task, Conversation, Message)
- API endpoint matches spec (POST /api/{user_id}/chat)

✅ **Rule 8: User Communication Standards**
- Agent instructions emphasize friendly confirmations
- All tool executions followed by natural language responses
- System personality: helpful todo assistant

✅ **Rule 9: Error Handling Requirements**
- Task not found → friendly message with recovery suggestion
- Invalid input → clarification request
- Tool failure → graceful degradation message without stack traces

✅ **Rule 10: Server Restart Resilience**
- All conversation state in database (survives restarts)
- No in-memory agent state
- Stateless FastAPI application can restart without data loss

**Constitution Check Result**: ✅ PASS - All 10 AI Agent Architecture Rules satisfied

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-chatbot/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── chat-api.yaml    # OpenAPI spec for POST /api/{user_id}/chat
│   └── mcp-tools.json   # MCP tool schema definitions
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

Extends existing Phase II backend structure:

```text
backend/
├── src/
│   ├── main.py                        # FastAPI app (ADD chat router)
│   ├── core/
│   │   ├── config.py                  # Settings (ADD OpenAI API key, MCP config)
│   │   ├── database.py                # Existing async session factory
│   │   ├── security.py                # Existing password hashing
│   │   └── exceptions.py              # Existing custom exceptions
│   ├── models/
│   │   ├── base.py                    # Existing TimestampModel
│   │   ├── user.py                    # Existing User model
│   │   ├── todo.py                    # Existing Todo model
│   │   ├── conversation.py            # NEW: Conversation model
│   │   └── message.py                 # NEW: Message model
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py              # Existing health check
│   │   │   ├── auth.py                # Existing auth endpoints
│   │   │   ├── todos.py               # Existing todo CRUD
│   │   │   └── chat.py                # NEW: POST /api/{user_id}/chat
│   │   ├── middleware/
│   │   │   ├── auth.py                # Existing get_current_user
│   │   │   └── error.py               # Existing exception handlers
│   │   └── dependencies.py            # Existing DB/auth dependencies
│   ├── services/
│   │   ├── auth_service.py            # Existing auth logic
│   │   ├── todo_service.py            # Existing todo CRUD logic
│   │   ├── validation.py              # Existing validators
│   │   ├── conversation_service.py    # NEW: Conversation CRUD
│   │   ├── message_service.py         # NEW: Message storage/retrieval
│   │   └── agent_service.py           # NEW: OpenAI agent orchestration
│   ├── repositories/
│   │   ├── user_repository.py         # Existing user data access
│   │   ├── todo_repository.py         # Existing todo data access
│   │   ├── conversation_repository.py # NEW: Conversation data access
│   │   └── message_repository.py      # NEW: Message data access
│   ├── mcp/
│   │   ├── __init__.py                # MCP server initialization
│   │   ├── server.py                  # MCP server setup and tool registration
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── add_task.py            # add_task MCP tool
│   │   │   ├── list_tasks.py          # list_tasks MCP tool
│   │   │   ├── complete_task.py       # complete_task MCP tool
│   │   │   ├── delete_task.py         # delete_task MCP tool
│   │   │   └── update_task.py         # update_task MCP tool
│   │   └── schemas.py                 # MCP tool input/output schemas
│   └── agent/
│       ├── __init__.py
│       ├── client.py                  # OpenAI Agents SDK client initialization
│       ├── instructions.py            # Agent system instructions
│       └── executor.py                # Agent execution loop with tool calling
├── migrations/
│   ├── env.py                         # Existing Alembic config
│   └── versions/
│       ├── [existing migrations...]   # Phase I/II migrations
│       └── c4d5e6f7g8h9_add_conversations_messages.py  # NEW migration
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── test_agent_service.py  # NEW
│   │   │   └── test_conversation_service.py  # NEW
│   │   └── mcp/
│   │       └── test_tools.py          # NEW: MCP tool unit tests
│   ├── integration/
│   │   └── api/
│   │       └── test_chat.py           # NEW: Chat endpoint tests
│   └── contract/
│       └── test_mcp_contracts.py      # NEW: MCP tool contract validation
├── alembic.ini                        # Existing Alembic configuration
├── requirements.txt                   # ADD: openai, mcp-sdk
└── .env                              # ADD: OPENAI_API_KEY
```

**Structure Decision**: Extends Phase II web application structure (backend/). This feature adds new models, services, repositories, and API routes to the existing backend. The MCP server and AI agent are new top-level modules within backend/src/. Frontend implementation (OpenAI ChatKit) is explicitly out of scope per specification.

## Phase 0: Research & Technology Decisions

### R0.1: OpenAI Agents SDK Integration Pattern

**Decision**: Use OpenAI Agents SDK with function calling (tools) for MCP integration

**Rationale**:
- OpenAI Agents SDK provides high-level abstractions for conversational agents
- Built-in support for function calling maps directly to MCP tools
- Handles conversation history management in message format
- Automatic retry and error handling for API calls

**Implementation Approach**:
1. Initialize OpenAI client with API key from environment
2. Define agent instructions (system message) for todo assistant behavior
3. Register MCP tools as OpenAI functions with JSON schema
4. Execute agent with conversation history + user message
5. Process tool calls returned by agent
6. Store assistant response with tool results

**Alternatives Considered**:
- LangChain: Rejected (too heavyweight, adds unnecessary abstractions)
- Direct OpenAI Chat Completions API: Rejected (need agent-level orchestration)
- Anthropic Claude: Rejected (specification mandates OpenAI Agents SDK)

### R0.2: MCP Server Architecture

**Decision**: In-process MCP server (same Python process as FastAPI)

**Rationale**:
- MCP tools need database access (async PostgreSQL session)
- In-process avoids inter-process communication overhead
- Simpler deployment (no separate MCP server process)
- Tools can share existing repositories and services

**Implementation Approach**:
1. Create mcp/ module in backend/src/
2. MCP tools import existing TodoRepository for database operations
3. Tools receive database session via dependency injection
4. FastAPI chat endpoint creates session → calls MCP tools → commits
5. Each tool performs single atomic operation (constitutional requirement)

**Alternatives Considered**:
- Separate MCP server process: Rejected (adds deployment complexity, IPC overhead)
- Standalone MCP service: Rejected (violates stateless requirement, harder to share database sessions)

### R0.3: Conversation History Management

**Decision**: Store full conversation history, retrieve recent 50 messages per request

**Rationale**:
- Constitutional requirement: fetch history from database on every request (stateless)
- Performance: 50 messages ≈ 25-50KB tokens, within OpenAI context limits
- Cost control: Avoid sending 100+ message conversations to OpenAI API
- User experience: 50 messages sufficient for multi-turn task management conversations

**Implementation Approach**:
1. Create Conversation table (user_id, id, timestamps)
2. Create Message table (conversation_id, role, content, created_at)
3. Query: `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 50`
4. Reverse message order for OpenAI API (oldest → newest)
5. Include message limit in configuration (settings.MAX_CONVERSATION_HISTORY)

**Alternatives Considered**:
- Unlimited history: Rejected (token cost, performance degradation)
- Message summarization: Rejected (adds complexity, deferred to Phase V)
- 20 messages: Rejected (insufficient for meaningful multi-turn conversations per spec)

### R0.4: MCP Tool Error Handling Strategy

**Decision**: Tools return structured error responses, agent converts to natural language

**Rationale**:
- Constitutional requirement: graceful error handling without stack traces
- OpenAI agents can interpret error responses and generate user-friendly messages
- Separation of concerns: tools report errors, agent handles user communication

**Tool Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 123 does not exist",
    "user_id": 5
  }
}
```

**Agent Instruction for Errors**:
"When a tool returns an error, explain the issue to the user in friendly language and suggest recovery actions. Example: 'I couldn't find task 123. Would you like to see your current tasks instead?'"

**Alternatives Considered**:
- Raise exceptions in tools: Rejected (breaks agent execution flow)
- Return None on error: Rejected (agent cannot distinguish error types)
- HTTP error codes: Rejected (tools are Python functions, not HTTP endpoints)

### R0.5: Agent Instruction Design

**Decision**: Comprehensive system instructions with examples and constraints

**System Instructions Template**:
```
You are a helpful todo assistant. Your job is to help users manage their tasks through natural conversation.

CAPABILITIES:
- Create tasks when users say things like "add a task", "remind me to", "I need to"
- List tasks when users ask "what's on my list", "show my tasks", "what do I need to do"
- Complete tasks when users say "I finished", "mark as done", "completed"
- Update tasks when users want to change title or description
- Delete tasks when users say "remove", "delete", "get rid of"

TOOL USAGE:
- Use add_task(user_id, title, description) to create tasks
- Use list_tasks(user_id, status) to retrieve tasks (status: "all", "completed", "incomplete")
- Use complete_task(user_id, task_id) to mark tasks done
- Use update_task(user_id, task_id, title, description) to modify tasks
- Use delete_task(user_id, task_id) to remove tasks

BEHAVIOR RULES:
- Always confirm actions with friendly natural language
- If task reference is ambiguous, ask for clarification
- If tool returns error, explain issue and suggest recovery
- Keep responses concise but warm
- Never expose technical errors or stack traces
- When users ask about unrelated topics, politely redirect to todo management

EXAMPLES:
User: "Add a task to buy groceries"
You: [Call add_task] "I've added 'buy groceries' to your list!"

User: "What's on my list?"
You: [Call list_tasks] "You have 3 tasks: 1. Buy groceries, 2. Call dentist, 3. Finish report"

User: "I finished the first one"
You: [Call complete_task] "Great! I've marked 'Buy groceries' as done."
```

**Rationale**:
- Clear capability boundaries prevent scope creep
- Examples guide LLM behavior for common scenarios
- Explicit tool signatures ensure correct parameter passing
- Constitutional compliance embedded in instructions (Rule 8: friendly confirmations)

**Alternatives Considered**:
- Minimal instructions: Rejected (insufficient guidance for edge cases)
- Few-shot prompting per request: Rejected (increases token costs)
- Separate instruction files per tool: Rejected (harder to maintain consistency)

### R0.6: Database Transaction Boundaries

**Decision**: Single transaction per chat request covering message storage + tool execution

**Transaction Flow**:
1. Begin transaction (async session)
2. Store user message
3. Fetch conversation history
4. Execute agent → get tool calls
5. Execute MCP tools (within same transaction)
6. Store assistant response with tool results
7. Commit transaction
8. Return response to user

**Rationale**:
- Atomic operations: Either all succeed or all rollback
- Consistency: User message and tool execution always synchronized
- Constitutional compliance: Stateless architecture with database persistence

**Error Handling**:
- If tool execution fails: Rollback entire transaction
- Store error message as assistant response
- User can retry without orphaned user messages

**Alternatives Considered**:
- Separate transactions per tool: Rejected (partial failures leave inconsistent state)
- Two-phase commit: Rejected (unnecessary complexity for single-database system)

## Phase 1: Design & Contracts

### Phase 1 Outputs

This phase generates the following artifacts:
1. **data-model.md**: Entity definitions for Conversation and Message
2. **contracts/chat-api.yaml**: OpenAPI specification for chat endpoint
3. **contracts/mcp-tools.json**: MCP tool schema definitions
4. **quickstart.md**: Developer setup guide with environment configuration

*(Phase 1 artifacts will be generated in subsequent workflow steps)*

## Architecture Overview

### Request Flow

```
1. User → POST /api/{user_id}/chat
   Body: { message: "Add task to buy milk", conversation_id?: "123" }

2. ChatRoute (chat.py)
   ↓
3. ConversationService.get_or_create_conversation(user_id, conversation_id)
   ↓
4. MessageService.store_message(conversation_id, role="user", content="...")
   ↓
5. MessageService.get_recent_history(conversation_id, limit=50)
   ↓
6. AgentService.execute(user_id, history, message)
   ↓
7. OpenAI Agents SDK
   - Interprets intent: "Create task"
   - Returns tool call: add_task(user_id=5, title="buy milk")
   ↓
8. AgentService calls MCP tool: MCPServer.execute_tool("add_task", {...})
   ↓
9. MCP add_task tool
   - TodoRepository.create(user_id, title, description)
   - Database INSERT
   - Returns: { success: true, task: {...} }
   ↓
10. AgentService formats response
    - "I've added 'buy milk' to your list! (Task #42)"
    ↓
11. MessageService.store_message(conversation_id, role="assistant", content="...")
    ↓
12. Commit transaction
    ↓
13. Return to user
    Body: {
      conversation_id: "123",
      response: "I've added 'buy milk' to your list! (Task #42)",
      tool_calls: [{ tool: "add_task", args: {...}, result: {...} }]
    }
```

### Component Interactions

```
┌─────────────┐
│   FastAPI   │ (Chat endpoint)
│   Route     │
└──────┬──────┘
       │
       v
┌─────────────────┐     ┌──────────────┐
│ Conversation    │────>│  Message     │
│ Service         │     │  Service     │
└────────┬────────┘     └──────┬───────┘
         │                     │
         v                     v
    ┌─────────────────────────────┐
    │    Agent Service            │
    │  (OpenAI Agents SDK)        │
    └─────────┬───────────────────┘
              │
              v
        ┌─────────────┐
        │ MCP Server  │
        └──────┬──────┘
               │
         ┌─────┴─────┐
         │  MCP Tools │
         └─────┬─────┘
               │
        ┌──────▼──────────┐
        │  Todo           │
        │  Repository     │
        └─────────────────┘
               │
               v
        ┌─────────────┐
        │ PostgreSQL  │
        └─────────────┘
```

### Stateless Architecture Enforcement

**Constitutional Requirement**: Backend must be completely stateless (Rule 1)

**Implementation**:
1. **No global state**: No module-level variables for conversations or agent context
2. **Request-scoped sessions**: Each chat request creates new database session
3. **Fetch history per request**: MessageService.get_recent_history() called every time
4. **No caching**: No in-memory conversation cache or LRU cache
5. **Stateless MCP tools**: Each tool receives all required parameters (user_id, task_id, etc.)
6. **Stateless agent**: Agent initialized per request with fresh conversation history

**Validation**:
- Unit tests verify no module-level mutable state
- Integration tests simulate server restart between requests
- Architecture review checks for singleton patterns or cached state

## Key Design Decisions

### D1: Why In-Process MCP Server?

**Decision**: MCP server runs in same process as FastAPI application

**Justification**:
- Tools need database access (share AsyncSession with FastAPI routes)
- Avoids IPC overhead (no gRPC or HTTP between processes)
- Simpler deployment (single Python process)
- Tools can reuse existing repositories (TodoRepository)

**Trade-offs**:
- ✅ Simpler architecture, easier debugging
- ✅ Lower latency (no serialization overhead)
- ❌ Cannot scale MCP independently from FastAPI (acceptable for Phase IV scope)

### D2: Why 50 Message History Limit?

**Decision**: Retrieve recent 50 messages per conversation

**Justification**:
- Balance between context and performance
- 50 messages ≈ 25-50KB tokens (well within OpenAI limits)
- Covers typical multi-turn todo conversations (spec requires 3+ turns)
- Configurable via settings.MAX_CONVERSATION_HISTORY

**Trade-offs**:
- ✅ Controlled token costs
- ✅ Predictable performance
- ❌ Very long conversations lose early context (deferred to Phase V summarization)

### D3: Why Single Transaction per Request?

**Decision**: User message storage + tool execution + assistant response in one transaction

**Justification**:
- Atomicity: All-or-nothing consistency
- Prevents orphaned user messages if tool fails
- Simplifies rollback logic (automatic on exception)

**Trade-offs**:
- ✅ Strong consistency guarantees
- ✅ Simpler error handling
- ❌ Longer transaction duration (acceptable for async operations)

### D4: Why OpenAI Agents SDK vs. Direct API?

**Decision**: Use OpenAI Agents SDK instead of raw Chat Completions API

**Justification**:
- Specification explicitly mandates "OpenAI Agents SDK" (FR-005)
- Higher-level abstractions for tool calling
- Built-in retry logic and error handling
- Better conversation history management

**Trade-offs**:
- ✅ Less boilerplate code
- ✅ Better error handling
- ❌ Slightly more opinionated structure (acceptable trade-off)

## Implementation Phases

### Phase 0: Research (Completed Above)
- ✅ OpenAI Agents SDK integration pattern
- ✅ MCP server architecture
- ✅ Conversation history strategy
- ✅ Error handling approach
- ✅ Agent instruction design
- ✅ Transaction boundaries

### Phase 1: Design & Contracts (Next)
Output files to generate:
1. `research.md` - Consolidate R0.1 through R0.6 decisions
2. `data-model.md` - Conversation and Message entity definitions
3. `contracts/chat-api.yaml` - OpenAPI spec for POST /api/{user_id}/chat
4. `contracts/mcp-tools.json` - MCP tool schemas (5 tools)
5. `quickstart.md` - Setup guide with OpenAI API key configuration

### Phase 2: Task Generation (After Phase 1)
Use `/sp.tasks` command to generate `tasks.md` with:
- Database migration tasks (Conversation, Message tables)
- MCP server implementation tasks (5 tools)
- Agent service implementation tasks
- Chat endpoint implementation tasks
- Testing tasks (unit, integration, contract)

## Risks & Mitigations

### R1: OpenAI API Rate Limits

**Risk**: High conversation volume could hit rate limits
**Mitigation**:
- Implement exponential backoff in AgentService
- Add request queuing if needed (Phase V)
- Monitor token usage per user

### R2: Conversation History Token Costs

**Risk**: 50-message history per request increases costs
**Mitigation**:
- Make limit configurable (settings.MAX_CONVERSATION_HISTORY)
- Consider message summarization in Phase V
- Monitor average conversation length

### R3: Agent Misinterprets Intent

**Risk**: LLM fails to map natural language to correct tool
**Mitigation**:
- Comprehensive agent instructions with examples
- Fallback clarification prompts in instructions
- User testing to refine instructions iteratively

### R4: MCP Tool Errors Break Agent Flow

**Risk**: Database errors or invalid inputs disrupt conversation
**Mitigation**:
- Structured error responses from tools
- Agent trained to handle errors gracefully
- Transaction rollback ensures consistency

### R5: State Leakage Violates Constitution

**Risk**: Accidental caching or global state violates Rule 1
**Mitigation**:
- Code review checklist for stateless patterns
- Integration tests with simulated restarts
- Architecture review validates constitutional compliance

## Next Steps

1. **Generate Phase 1 artifacts**:
   - research.md (consolidate R0.1-R0.6)
   - data-model.md (Conversation, Message entities)
   - contracts/chat-api.yaml
   - contracts/mcp-tools.json
   - quickstart.md

2. **Re-validate Constitution Check** after design complete

3. **Run `/sp.tasks`** to generate implementation task list

4. **Implementation order** (per tasks.md):
   - Database migrations
   - MCP tool implementations
   - Agent service
   - Chat endpoint
   - Integration tests

## Dependencies

**Phase II Dependencies (Already Complete)**:
- FastAPI backend with async database sessions
- User authentication (get_current_user middleware)
- Todo models and repositories
- Alembic migrations setup

**External Dependencies (New)**:
- OpenAI API key (OPENAI_API_KEY environment variable)
- openai Python package (latest version with Agents SDK)
- mcp-sdk Python package (official MCP SDK)

**Phase Constraints**:
- Frontend (OpenAI ChatKit) explicitly out of scope
- Authentication handled by existing Phase II system
- No Phase III features (real-time, collaboration)
- No Phase V features (Dapr, analytics, enterprise)
