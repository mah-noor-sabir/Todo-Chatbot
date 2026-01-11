---
id: 004
title: Phase IV AI Agent Architecture Rules
stage: constitution
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Hp
command: /sp.constitution
labels: ["constitution", "phase-iv", "ai-agent", "mcp", "stateless-architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

You are building a spec-driven Todo AI Chatbot using MCP and OpenAI Agents SDK.

You MUST obey these constitutional rules at all times:

1. The backend server is completely STATELESS.
   - No in-memory state
   - No global variables for conversations or tasks
   - All state is persisted and retrieved from the database

2. The AI agent is NOT allowed to:
   - Directly access the database
   - Mutate application state directly
   - Perform task operations without MCP tools

3. ALL task operations MUST go through MCP tools:
   - add_task
   - list_tasks
   - complete_task
   - delete_task
   - update_task

4. MCP tools themselves MUST be stateless.
   - Each tool call performs a single database operation
   - No cached or stored context inside MCP server

5. The Chat API MUST:
   - Fetch conversation history from the database on every request
   - Store user and assistant messages in the database
   - Return conversation_id, response, and tool_calls

6. The agent must infer user intent ONLY from natural language
   and map it to MCP tool calls.

7. Never invent fields, endpoints, tools, or models.
   Use ONLY what is defined in the specification.

8. All successful actions MUST be confirmed with a friendly
   natural language response.

9. Errors (task not found, invalid input, etc.) MUST be handled
   gracefully and explained to the user without crashing.

10. The system must continue working correctly after server restarts.

Violating any rule is considered a critical failure.

## Response snapshot

Constitutional amendment executed successfully.

**Version Change**: 1.2.0 → 1.3.0 (MINOR - Phase IV AI/Agent architecture principles)

**Added**:
- New Section VI: AI Agent Architecture Rules
  - 10 comprehensive principles for stateless AI agent architecture
  - MCP tool mandatory interface requirements
  - Natural language intent mapping guidelines
  - Error handling and resilience standards
- Expanded Phase IV Scope Definition
  - Detailed chatbot interface requirements
  - OpenAI Agents SDK integration specifications
  - MCP server implementation guidelines
  - Conversation persistence architecture

**Modified**:
- Phase IV from placeholder to fully-specified AI enhancement phase
- Technology authorization matrix updated with AI/Agent phase gating

**Validation**:
- Templates validated for compatibility (all ✅)
- Constitution Check section in plan-template.md will validate Phase IV work
- Spec and tasks templates support Phase IV requirements
- No template modifications needed

**Impact**:
This amendment establishes foundational governance for Phase IV implementation, ensuring all AI-powered features adhere to stateless architecture, proper MCP tool usage, and graceful error handling. The principles prevent common pitfalls in AI agent development such as state leakage, direct database access, and poor user experience.

## Outcome

- ✅ Impact: Constitution updated to v1.3.0 with Phase IV AI/Agent architecture governance
- 🧪 Tests: none (constitutional document)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Create Phase IV specification using /sp.specify
- 🧠 Reflection: This amendment provides critical architectural constraints for Phase IV, ensuring the AI chatbot implementation will be stateless, testable, and maintainable. The 10 principles directly address the requirements provided and integrate seamlessly with existing Phase I-III governance.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): All validations passed - no template conflicts, version incremented correctly, all placeholders filled
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): When Phase IV spec is created, validate AI agent architecture against Section VI principles
