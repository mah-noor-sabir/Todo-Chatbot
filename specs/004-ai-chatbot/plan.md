# Implementation Plan: Todo AI Chatbot

**Branch**: `004-ai-chatbot` | **Date**: 2026-02-02 | **Spec**: [specs/004-ai-chatbot/spec.md](specs/004-ai-chatbot/spec.md)
**Input**: Feature specification from `/specs/004-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a stateless AI-powered chatbot that allows users to manage todo tasks via natural language. The system uses OpenAI Agents SDK for natural language processing and Model Context Protocol (MCP) tools for all database operations. The backend is completely stateless with conversation history persisted in the database and reconstructed on each request.

## Technical Context

**Language/Version**: Python 3.11, TypeScript/JavaScript for frontend
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP Server, SQLModel, Next.js, React
**Storage**: PostgreSQL database with Neon Serverless
**Testing**: pytest for backend, Jest for frontend
**Target Platform**: Web application with REST API backend and React frontend
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Task creation under 3 seconds, task listing under 2 seconds, 90% intent recognition accuracy
**Constraints**: Stateless backend, MCP-only database access, conversation history bounding, 95% graceful error handling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stateless Backend Architecture**: Backend must be completely stateless with no in-memory conversation state
- **AI Agent Access Restrictions**: AI agents must not directly access database or ORM
- **MCP Tool Mandatory Interface**: All task operations must go through MCP tools exclusively
- **Stateless MCP Tool Design**: Each MCP tool must perform single atomic operation without caching
- **Chat API Persistence Requirements**: API must fetch conversation history from DB on every request
- **Natural Language Intent Mapping**: Agent must infer intent from natural language only
- **Server Restart Resilience**: System must maintain conversation continuity across restarts
- **User Communication Standards**: Responses must be friendly and conversational
- **Error Handling Requirements**: System must handle errors gracefully without exposing internals

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   │       └── chat.py
│   ├── models/
│   │   └── conversation.py
│   ├── repositories/
│   │   └── conversation_repository.py
│   ├── services/
│   │   └── agent_service.py
│   └── mcp/
│       └── tools/
│           ├── add_task.py
│           ├── list_tasks.py
│           ├── complete_task.py
│           ├── delete_task.py
│           └── update_task.py
└── tests/

frontend/
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── todos/
│   │       └── page.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   └── todos/
│   │       └── TodoList.tsx
│   └── hooks/
│       └── useMultiChat.ts
└── tests/

mcp/
├── server.py
├── tools/
│   ├── task_add.py
│   ├── task_list.py
│   ├── task_complete.py
│   ├── task_delete.py
│   └── task_update.py
└── config/
    └── mcp_config.py
```

**Structure Decision**: Web application with separate backend (FastAPI), frontend (Next.js), and MCP server components to maintain clear architectural separation between AI reasoning layer, API orchestration layer, and data authority layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MCP Server Architecture | Required to enforce architectural constraint that AI agents never touch database directly | Direct database access from agent would violate constitutional requirement |
| Conversation History Bounding | Required for performance with long conversations while maintaining correctness | Unlimited history would cause performance degradation |
| Multi-component Architecture | Required to enforce import boundaries between agent, API, and data layers | Single component would allow architectural violations |
