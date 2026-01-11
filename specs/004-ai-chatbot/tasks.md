---
description: "Task list for Todo AI Chatbot implementation"
---

# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/004-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` at repository root
- Extends Phase II backend structure
- All paths shown are absolute within backend directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Add OpenAI and MCP SDK dependencies to backend/requirements.txt
- [ ] T002 Add OPENAI_API_KEY and MAX_CONVERSATION_HISTORY to backend/src/core/config.py Settings class
- [ ] T003 [P] Create backend/src/mcp/ directory structure (__init__.py, server.py, tools/, schemas.py)
- [ ] T004 [P] Create backend/src/agent/ directory structure (__init__.py, client.py, instructions.py, executor.py)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [ ] T005 Create backend/src/models/conversation.py with Conversation SQLModel (user_id FK, timestamps)
- [ ] T006 Create backend/src/models/message.py with Message SQLModel (conversation_id FK, user_id FK, role, content, created_at)
- [ ] T007 Update backend/src/models/user.py to add conversations and messages relationships
- [ ] T008 Create Alembic migration backend/migrations/versions/c4d5e6f7g8h9_add_conversations_messages.py

### Repositories

- [ ] T009 [P] Create backend/src/repositories/conversation_repository.py with get_by_id, create, get_by_user_id methods
- [ ] T010 [P] Create backend/src/repositories/message_repository.py with create, get_recent_history methods

### Services

- [ ] T011 [P] Create backend/src/services/conversation_service.py with get_or_create_conversation method
- [ ] T012 [P] Create backend/src/services/message_service.py with store_message, get_recent_history(limit=50) methods

### MCP Infrastructure

- [ ] T013 Create backend/src/mcp/schemas.py with ToolResult, ToolError Pydantic models
- [ ] T014 Create backend/src/mcp/server.py with MCPServer class (register_tool, execute_tool methods)

### Agent Infrastructure

- [ ] T015 Create backend/src/agent/client.py to initialize OpenAI client from settings.OPENAI_API_KEY
- [ ] T016 Create backend/src/agent/instructions.py with AGENT_INSTRUCTIONS string (capabilities, tool usage, behavior rules, examples)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Task via Natural Language (Priority: P1) 🎯 MVP

**Goal**: User can create tasks conversationally and receive friendly confirmation

**Independent Test**: Send "Remind me to buy groceries" → Task created with title "Buy groceries" → Response: "I've added 'buy groceries' to your list!"

### MCP Tool Implementation

- [ ] T017 [P] [US1] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py (user_id, title, description? → ToolResult with task_id)
- [ ] T018 [P] [US1] Register add_task tool in backend/src/mcp/server.py MCPServer initialization

### Agent Service

- [ ] T019 [US1] Create backend/src/services/agent_service.py with execute method (user_id, history, message → agent response with tool_calls)
- [ ] T020 [US1] Implement backend/src/agent/executor.py with process_tool_calls function (execute MCP tools, format results)

### Chat Endpoint

- [ ] T021 [US1] Create backend/src/api/routes/chat.py with POST /api/{user_id}/chat endpoint
- [ ] T022 [US1] Implement chat request handling: get/create conversation → store user message → fetch history
- [ ] T023 [US1] Implement agent execution: call AgentService.execute → process tool_calls → store assistant response
- [ ] T024 [US1] Implement chat response formatting: return conversation_id, response text, tool_calls array
- [ ] T025 [US1] Register chat router in backend/src/main.py FastAPI app

### Error Handling

- [ ] T026 [US1] Add error handling in chat endpoint for OpenAI API failures (return 500 with user-friendly message)
- [ ] T027 [US1] Add error handling for MCP tool failures (rollback transaction, return graceful error)
- [ ] T028 [US1] Add logging for chat requests (user_id, message length, tool_calls, response time)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - List Tasks via Natural Language (Priority: P2)

**Goal**: User can query their tasks conversationally and receive formatted list

**Independent Test**: Send "What's on my todo list?" → System retrieves all tasks → Response lists tasks with status

### MCP Tool Implementation

- [ ] T029 [P] [US2] Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py (user_id, status? → ToolResult with tasks array)
- [ ] T030 [P] [US2] Register list_tasks tool in backend/src/mcp/server.py MCPServer initialization

### Agent Instructions Enhancement

- [ ] T031 [US2] Update backend/src/agent/instructions.py to add list_tasks examples ("What's on my list?" → list_tasks call)

**Checkpoint**: User Story 2 complete - user can create and list tasks

---

## Phase 5: User Story 3 - Complete Task via Natural Language (Priority: P3)

**Goal**: User can mark tasks complete conversationally with confirmation

**Independent Test**: Send "I finished task 5" → Task 5 marked complete → Response: "Great! I've marked 'Task title' as done."

### MCP Tool Implementation

- [ ] T032 [P] [US3] Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py (user_id, task_id → ToolResult with updated task)
- [ ] T033 [P] [US3] Register complete_task tool in backend/src/mcp/server.py MCPServer initialization

### Agent Instructions Enhancement

- [ ] T034 [US3] Update backend/src/agent/instructions.py to add complete_task examples and title-matching guidance

### Error Handling

- [ ] T035 [US3] Add TASK_NOT_FOUND error handling in complete_task tool (return ToolResult with error code)
- [ ] T036 [US3] Update agent instructions for task-not-found recovery suggestions

**Checkpoint**: User Story 3 complete - user can create, list, and complete tasks

---

## Phase 6: User Story 4 - Update Task via Natural Language (Priority: P4)

**Goal**: User can modify task details conversationally

**Independent Test**: Send "Change task 3 title to 'Call dentist'" → Task 3 title updated → Response confirms change

### MCP Tool Implementation

- [ ] T037 [P] [US4] Implement update_task MCP tool in backend/src/mcp/tools/update_task.py (user_id, task_id, title?, description? → ToolResult with updated task)
- [ ] T038 [P] [US4] Register update_task tool in backend/src/mcp/server.py MCPServer initialization

### Agent Instructions Enhancement

- [ ] T039 [US4] Update backend/src/agent/instructions.py to add update_task examples

**Checkpoint**: User Story 4 complete - full task modification support

---

## Phase 7: User Story 5 - Delete Task via Natural Language (Priority: P5)

**Goal**: User can remove tasks conversationally

**Independent Test**: Send "Delete task 7" → Task 7 removed → Response confirms deletion

### MCP Tool Implementation

- [ ] T040 [P] [US5] Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py (user_id, task_id → ToolResult with confirmation)
- [ ] T041 [P] [US5] Register delete_task tool in backend/src/mcp/server.py MCPServer initialization

### Agent Instructions Enhancement

- [ ] T042 [US5] Update backend/src/agent/instructions.py to add delete_task examples

### Tool Chaining Support

- [ ] T043 [US5] Test multi-tool chaining in agent executor: "Delete all completed tasks" → list_tasks(status=completed) → delete_task for each

**Checkpoint**: User Story 5 complete - full CRUD operations via chat

---

## Phase 8: User Story 6 - Multi-Turn Conversation Continuity (Priority: P6)

**Goal**: User can engage in multi-turn conversations with context retention

**Independent Test**: Turn 1: "Show my tasks" → Agent lists tasks. Turn 2: "Delete the first one" → Agent uses context to identify task

### Conversation Context Enhancement

- [ ] T044 [US6] Verify get_recent_history retrieves messages in chronological order (oldest first for OpenAI API)
- [ ] T045 [US6] Test conversation continuity: verify conversation_id persisted across multiple requests
- [ ] T046 [US6] Update agent instructions to handle ambiguous references ("the first one", "that task")

### Context Window Management

- [ ] T047 [US6] Implement MAX_CONVERSATION_HISTORY limit (default 50) in MessageService.get_recent_history
- [ ] T048 [US6] Add logging for conversation history size (message count, estimated tokens)

**Checkpoint**: User Story 6 complete - full conversational experience with context

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, observability, and production readiness

### Error Handling Refinements

- [ ] T049 [P] Add INVALID_INPUT error handling across all MCP tools (empty title, invalid IDs)
- [ ] T050 [P] Add DATABASE_ERROR handling with retry suggestions in MCP tools
- [ ] T051 [P] Add UNAUTHORIZED error handling in MCP tools (user doesn't own task)

### Logging & Observability

- [ ] T052 [P] Add structured logging for MCP tool calls (tool_name, arguments, success/failure, duration)
- [ ] T053 [P] Add OpenAI API token usage logging in AgentService (total_tokens, estimated_cost)
- [ ] T054 [P] Add conversation metrics logging (messages_per_conversation, tools_per_request)

### Stateless Architecture Validation

- [ ] T055 Verify no module-level mutable state in mcp/, agent/, services/ modules
- [ ] T056 Verify conversation history fetched from database on every chat request
- [ ] T057 Test server restart resilience: restart backend mid-conversation, verify next request succeeds

### Agent Instructions Refinement

- [ ] T058 Add off-topic handling to agent instructions ("What's the weather?" → redirect to todo management)
- [ ] T059 Add ambiguous reference handling examples ("Complete the meeting one" with multiple matches → ask for clarification)
- [ ] T060 Add error recovery examples for each error code (TASK_NOT_FOUND, INVALID_INPUT, DATABASE_ERROR)

### Configuration

- [ ] T061 [P] Add MAX_CONVERSATION_HISTORY to .env.example
- [ ] T062 [P] Add OPENAI_MODEL configuration (default: gpt-4) to backend/src/core/config.py

---

## Dependencies

**User Story Dependencies** (completion order):
- Phase 1 & 2 (Foundational) → BLOCKS ALL user stories
- US1 (Create Task) → INDEPENDENT
- US2 (List Tasks) → INDEPENDENT (can be tested with seed data)
- US3 (Complete Task) → DEPENDS ON US1 (needs tasks to complete)
- US4 (Update Task) → DEPENDS ON US1 (needs tasks to update)
- US5 (Delete Task) → DEPENDS ON US1 (needs tasks to delete)
- US6 (Multi-Turn Context) → DEPENDS ON US1-US5 (tests context across all operations)

**Suggested MVP**: Phase 1, Phase 2, Phase 3 (US1 only)

---

## Parallel Execution Opportunities

### Phase 1 (Setup)
- T003 (MCP directory) and T004 (Agent directory) can run in parallel

### Phase 2 (Foundational)
- T009 (ConversationRepository) and T010 (MessageRepository) in parallel
- T011 (ConversationService) and T012 (MessageService) in parallel
- T013 (MCP schemas) and T015 (Agent client) in parallel

### Phase 3 (US1)
- T017 (add_task tool) and T018 (register tool) sequentially
- T026, T027, T028 (error handling & logging) in parallel after T025

### Phase 4-7 (US2-US5)
- Each MCP tool implementation (T029, T032, T037, T040) can run in parallel across stories
- Tool registration (T030, T033, T038, T041) depends on corresponding implementation

### Phase 9 (Polish)
- T049, T050, T051 (error handling) in parallel
- T052, T053, T054 (logging) in parallel
- T061, T062 (configuration) in parallel

---

## Implementation Strategy

### MVP Delivery (Phases 1-3)
1. **Phase 1 & 2**: Foundational infrastructure (T001-T016)
2. **Phase 3 (US1)**: Create task via chat (T017-T028)
3. **Test MVP**: "Add a task to buy groceries" → Task created → "I've added 'buy groceries' to your list!"

### Incremental Delivery (Phases 4-7)
- **Phase 4 (US2)**: Add list_tasks (T029-T031)
- **Phase 5 (US3)**: Add complete_task (T032-T036)
- **Phase 6 (US4)**: Add update_task (T037-T039)
- **Phase 7 (US5)**: Add delete_task with chaining (T040-T043)
- **Phase 8 (US6)**: Multi-turn context (T044-T048)

### Production Readiness (Phase 9)
- **Error Handling**: Comprehensive error coverage (T049-T051)
- **Observability**: Logging and metrics (T052-T054)
- **Validation**: Architecture compliance (T055-T057)
- **Refinement**: Agent instructions polish (T058-T060)
- **Configuration**: Production settings (T061-T062)

---

## Task Summary

**Total Tasks**: 62
**Task Breakdown by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 12 tasks
- Phase 3 (US1 - Create Task): 12 tasks
- Phase 4 (US2 - List Tasks): 3 tasks
- Phase 5 (US3 - Complete Task): 5 tasks
- Phase 6 (US4 - Update Task): 3 tasks
- Phase 7 (US5 - Delete Task): 4 tasks
- Phase 8 (US6 - Multi-Turn Context): 5 tasks
- Phase 9 (Polish): 14 tasks

**Parallelization Opportunities**: 25 tasks marked with [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (28 tasks) delivers basic conversational task creation

**Independent Test Criteria**:
- US1: Create task via "Remind me to X" → Confirmation response
- US2: List tasks via "What's on my list?" → Formatted task list
- US3: Complete task via "I finished task N" → Completion confirmation
- US4: Update task via "Change task N title to X" → Update confirmation
- US5: Delete task via "Delete task N" → Deletion confirmation
- US6: Multi-turn context via "Show tasks" → "Delete the first one" → Context-aware deletion

---

## Constitutional Compliance Checklist

- [ ] All tasks respect stateless architecture (no in-memory state)
- [ ] Agent cannot directly access database (all through MCP tools)
- [ ] MCP tools perform single atomic operations
- [ ] Conversation history fetched from database every request
- [ ] All task operations scoped to authenticated user_id
- [ ] Error handling returns user-friendly messages (no stack traces)
- [ ] Natural language intent mapping (no command parsing)
- [ ] Friendly confirmations for all successful operations

---

## Testing Strategy

**Manual Testing** (no automated tests specified in requirements):

**US1 Test**:
```
POST /api/1/chat
{
  "message": "Add a task to buy groceries"
}

Expected:
{
  "conversation_id": 1,
  "response": "I've added 'buy groceries' to your list!",
  "tool_calls": [{"tool": "add_task", "result": {"success": true, "data": {"task_id": 42}}}]
}
```

**US2 Test**:
```
POST /api/1/chat
{
  "message": "What's on my todo list?",
  "conversation_id": 1
}

Expected: Lists all tasks
```

**US3 Test**:
```
POST /api/1/chat
{
  "message": "I finished task 42",
  "conversation_id": 1
}

Expected: Task 42 marked complete with confirmation
```

**US6 Multi-Turn Test**:
```
Request 1: "Show my tasks"
Response 1: "You have 3 tasks: 1. Buy groceries, 2. Call dentist, 3. Finish report"

Request 2: "Delete the first one" (conversation_id from request 1)
Response 2: "Done! I've removed 'Buy groceries' from your list."
```

**Server Restart Test**:
1. Start conversation, create task
2. Restart backend server
3. Continue conversation with same conversation_id
4. Expected: Conversation history intact, can reference previous context

---

## Next Steps

1. **Start with MVP**: Implement Phases 1-3 (T001-T028)
2. **Test MVP thoroughly**: Verify US1 works end-to-end
3. **Incremental delivery**: Add US2-US5 one at a time (Phases 4-7)
4. **Polish**: Implement Phase 9 for production readiness
5. **Manual validation**: Test all user stories and edge cases per Testing Strategy

## References

- **Specification**: `specs/004-ai-chatbot/spec.md`
- **Plan**: `specs/004-ai-chatbot/plan.md`
- **Data Model**: `specs/004-ai-chatbot/data-model.md`
- **API Contracts**: `specs/004-ai-chatbot/contracts/`
- **Research**: `specs/004-ai-chatbot/research.md`
- **Quickstart**: `specs/004-ai-chatbot/quickstart.md`
