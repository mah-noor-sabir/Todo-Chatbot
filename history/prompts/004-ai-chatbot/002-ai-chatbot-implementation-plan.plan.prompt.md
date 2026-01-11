---
id: 002
title: AI Chatbot Implementation Plan
stage: plan
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-ai-chatbot
branch: 004-ai-chatbot
user: Hp
command: /sp.plan
labels: ["plan", "phase-iv", "architecture", "mcp-tools", "openai-agents"]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/004-ai-chatbot/plan.md
 - specs/004-ai-chatbot/research.md
 - specs/004-ai-chatbot/data-model.md
 - specs/004-ai-chatbot/contracts/chat-api.yaml
 - specs/004-ai-chatbot/contracts/mcp-tools.json
 - specs/004-ai-chatbot/quickstart.md
tests:
 - none
---

## Prompt

Create a step-by-step implementation plan for the Todo AI Chatbot.

The plan must include:

1. Database layer
   - SQLModel models
   - Migrations for tasks, conversations, messages

2. MCP Server
   - Tool definitions for all task operations
   - Stateless execution
   - Database persistence per tool call

3. AI Agent Layer
   - OpenAI Agents SDK setup
   - Agent instructions and behavior rules
   - Tool registration using MCP

4. FastAPI Chat Endpoint
   - POST /api/{user_id}/chat
   - Conversation retrieval and persistence
   - Agent execution
   - Response formatting

5. Error handling
   - Task not found
   - Invalid input
   - Tool failures

6. Testing strategy
   - Manual test prompts
   - Multi-turn conversation validation
   - Server restart validation

The plan must respect stateless architecture at every step.

## Response snapshot

Successfully created comprehensive implementation plan for Phase IV AI Chatbot.

**Plan File**: specs/004-ai-chatbot/plan.md (672 lines)

**Phase 0: Research Completed** (research.md - 580 lines)
- R0.1: OpenAI Agents SDK integration pattern (function calling for MCP)
- R0.2: In-process MCP server architecture (share database sessions)
- R0.3: 50-message conversation history limit (balance context/cost)
- R0.4: Structured ToolResult error responses (graceful handling)
- R0.5: Comprehensive agent instructions (capabilities, examples, rules)
- R0.6: Single transaction per request (atomic operations)

**Phase 1: Design Completed**:
1. data-model.md (290 lines)
   - Conversation entity (user_id, id, timestamps)
   - Message entity (conversation_id, role, content, created_at)
   - Migration script for Alembic
   - Query patterns for history retrieval

2. contracts/chat-api.yaml (OpenAPI spec)
   - POST /api/{user_id}/chat endpoint
   - ChatRequest schema (message, conversation_id?)
   - ChatResponse schema (conversation_id, response, tool_calls)
   - ToolResult schema (success, data, error)
   - Error responses (400, 401, 500)

3. contracts/mcp-tools.json (MCP tool definitions)
   - add_task(user_id, title, description?)
   - list_tasks(user_id, status?)
   - complete_task(user_id, task_id)
   - delete_task(user_id, task_id)
   - update_task(user_id, task_id, title?, description?)
   - Error codes catalog (TASK_NOT_FOUND, INVALID_INPUT, etc.)

4. quickstart.md (Developer setup guide)
   - Environment configuration (OPENAI_API_KEY)
   - Database migration steps
   - Development workflow
   - Manual testing scenarios
   - Troubleshooting guide

**Constitution Check Results**: ✅ ALL PASS

**Phase IV Technology Compliance**:
- ✅ OpenAI Agents SDK (authorized for Phase IV)
- ✅ MCP SDK (authorized for Phase IV)
- ✅ FastAPI/SQLModel (extends Phase II)
- ❌ Dapr (correctly deferred to Phase V)

**Section VI AI Agent Architecture Rules** (10/10 passed):
1. ✅ Stateless backend (fetch history from DB per request)
2. ✅ Agent access restrictions (no direct database access)
3. ✅ MCP tool mandatory interface (all 5 tools implemented)
4. ✅ Stateless MCP tool design (atomic operations)
5. ✅ Chat API persistence (conversation_id, response, tool_calls)
6. ✅ Natural language intent mapping (no command parsing)
7. ✅ Specification adherence (tools match spec contracts)
8. ✅ User communication standards (friendly confirmations in instructions)
9. ✅ Error handling (structured ToolResult responses)
10. ✅ Server restart resilience (database persistence)

**Architecture Highlights**:

**Request Flow**:
1. POST /api/{user_id}/chat → ChatRoute
2. Get/create conversation → Store user message
3. Fetch recent 50 messages from database
4. Execute OpenAI agent with conversation history
5. Agent returns tool calls (e.g., add_task)
6. Execute MCP tools within same transaction
7. Store assistant response → Commit transaction
8. Return conversation_id + response + tool_calls

**Stateless Enforcement**:
- No global state or module-level variables
- Request-scoped AsyncSession per chat request
- MessageService.get_recent_history() called every request
- No in-memory conversation cache
- MCP tools receive all parameters (stateless functions)

**Key Design Decisions**:
- D1: In-process MCP server (share database sessions, avoid IPC)
- D2: 50-message history limit (balance context/cost, configurable)
- D3: Single transaction per request (atomic, consistent)
- D4: OpenAI Agents SDK vs. raw API (spec mandate, higher abstractions)

**Project Structure**:
- Extends Phase II backend/ directory
- New modules: src/mcp/, src/agent/
- New models: conversation.py, message.py
- New services: conversation_service.py, message_service.py, agent_service.py
- New route: api/routes/chat.py
- Migration: c4d5e6f7g8h9_add_conversations_messages.py

**Performance Goals**:
- <3 seconds for task creation via chat
- <2 seconds for task queries
- <50ms for history retrieval (50 messages)
- 1-3 seconds OpenAI API latency

**Error Handling Strategy**:
- Tools return ToolResult(success, data, error)
- Error codes: TASK_NOT_FOUND, INVALID_INPUT, DATABASE_ERROR, etc.
- Agent instructions include error handling examples
- Transaction rollback on any failure

**Testing Strategy** (manual):
- Create task: "Remind me to call mom"
- List tasks: "What's on my list?"
- Complete task: "I finished calling mom" (title match)
- Multi-turn context: "Show tasks" → "Delete the first one"
- Error scenarios: "Complete task 999" (not found)
- Server restart: Verify conversation survives restart

**Dependencies**:
- OpenAI API key (OPENAI_API_KEY environment variable)
- openai Python package (>=1.10.0)
- mcp-sdk Python package (>=0.1.0)
- Phase II infrastructure (FastAPI, SQLModel, Alembic, Neon PostgreSQL)

## Outcome

- ✅ Impact: Complete implementation plan for Phase IV AI Chatbot with constitutional compliance
- 🧪 Tests: Constitution Check validated (14/14 rules passed)
- 📁 Files: plan.md, research.md, data-model.md, chat-api.yaml, mcp-tools.json, quickstart.md
- 🔁 Next prompts: Run `/sp.tasks` to generate implementation task list
- 🧠 Reflection: Plan successfully balances architectural complexity with Phase IV scope constraints. Research phase resolved all technical unknowns (OpenAI SDK patterns, MCP architecture, conversation history, error handling, transactions). Phase 1 design artifacts provide clear contracts for implementation. All 10 constitutional AI agent rules validated and embedded in architecture. Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Constitution Check - 14/14 items PASSED, Technology compliance - PASS, Stateless architecture validation - PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): When implementing, validate OpenAI Agents SDK function calling format matches MCP tool schemas exactly
