# Quickstart: Todo AI Chatbot

**Feature**: 004-ai-chatbot (Phase IV)
**Date**: 2026-01-02
**Purpose**: Developer setup guide for AI chatbot implementation

This guide explains how to set up the development environment for implementing and testing the Todo AI Chatbot.

## Prerequisites

Ensure Phase II backend is already set up and running:
- Python 3.11+ installed
- PostgreSQL database (Neon) configured
- Backend virtual environment created
- Phase II migrations applied
- Phase II backend running at http://localhost:8000

## Environment Configuration

### 1. OpenAI API Key

Obtain an OpenAI API key and add it to your backend `.env` file:

```bash
cd backend
```

Edit `.env` and add:
```
OPENAI_API_KEY=sk-proj-...your-key-here
MAX_CONVERSATION_HISTORY=50
```

**Where to get OpenAI API key**:
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key immediately (won't be shown again)
5. Add to `.env` file

### 2. Install New Dependencies

Add OpenAI and MCP SDK to requirements:

```bash
cd backend
pip install openai mcp-sdk
```

Or add to `requirements.txt`:
```
# ... existing dependencies ...

# Phase IV: AI Chatbot
openai>=1.10.0
mcp-sdk>=0.1.0
```

Then install:
```bash
pip install -r requirements.txt
```

### 3. Verify Configuration

Create a test script to verify OpenAI API key:

```bash
python -c "from openai import OpenAI; import os; client = OpenAI(api_key=os.getenv('OPENAI_API_KEY')); print('OpenAI client initialized successfully')"
```

Expected output:
```
OpenAI client initialized successfully
```

## Database Migration

### Apply Phase IV Migration

Run Alembic migration to create `conversations` and `messages` tables:

```bash
cd backend
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade b2c3d4e5f6g7 -> c4d5e6f7g8h9, add conversations and messages tables
```

### Verify Migration

Check tables created:
```bash
psql $DATABASE_URL -c "\dt"
```

Expected tables:
```
          List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+---------
 public | alembic_version | table | ...
 public | users           | table | ...
 public | todos           | table | ...
 public | conversations   | table | ...  <- NEW
 public | messages        | table | ...  <- NEW
```

## Project Structure

After implementation, your backend structure will be:

```
backend/
├── src/
│   ├── models/
│   │   ├── conversation.py   # NEW
│   │   └── message.py         # NEW
│   ├── repositories/
│   │   ├── conversation_repository.py   # NEW
│   │   └── message_repository.py        # NEW
│   ├── services/
│   │   ├── conversation_service.py   # NEW
│   │   ├── message_service.py        # NEW
│   │   └── agent_service.py          # NEW
│   ├── mcp/                    # NEW MODULE
│   │   ├── server.py
│   │   ├── schemas.py
│   │   └── tools/
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agent/                  # NEW MODULE
│   │   ├── client.py
│   │   ├── instructions.py
│   │   └── executor.py
│   └── api/routes/
│       └── chat.py             # NEW
└── tests/
    ├── unit/
    │   ├── services/
    │   │   └── test_agent_service.py   # NEW
    │   └── mcp/
    │       └── test_tools.py           # NEW
    └── integration/
        └── api/
            └── test_chat.py            # NEW
```

## Development Workflow

### 1. Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload
```

Backend runs at: http://localhost:8000

### 2. Test Chat Endpoint

Once implemented, test with curl:

```bash
# Start new conversation
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-jwt-token" \
  -d '{"message": "Add a task to buy groceries"}'
```

Expected response:
```json
{
  "conversation_id": 1,
  "response": "I've added 'buy groceries' to your list!",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"user_id": 1, "title": "buy groceries"},
      "result": {"success": true, "data": {"task_id": 42, "title": "buy groceries"}}
    }
  ]
}
```

### 3. Continue Conversation

```bash
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-jwt-token" \
  -d '{"message": "What'\''s on my list?", "conversation_id": 1}'
```

### 4. Run Tests

```bash
cd backend

# Run all tests
pytest

# Run Phase IV tests only
pytest tests/unit/mcp/
pytest tests/unit/services/test_agent_service.py
pytest tests/integration/api/test_chat.py

# Run with coverage
pytest --cov=src/mcp --cov=src/agent --cov=src/services/agent_service
```

## Manual Testing Scenarios

### Scenario 1: Create Task
```
User: "Remind me to call mom tomorrow"
Expected: Task created with title "call mom tomorrow"
```

### Scenario 2: List Tasks
```
User: "What do I need to do?"
Expected: Lists all incomplete tasks
```

### Scenario 3: Complete Task
```
User: "I finished calling mom"
Expected: Task marked as completed (requires agent to find task by title match)
```

### Scenario 4: Multi-Turn Context
```
Turn 1 User: "Show my tasks"
Turn 1 Agent: "You have 3 tasks: 1. Buy groceries, 2. Call mom, 3. Finish report"

Turn 2 User: "Delete the first one"
Turn 2 Agent: [Uses context] "Done! I've removed 'Buy groceries' from your list."
```

### Scenario 5: Error Handling
```
User: "Complete task 999"
Expected: "I couldn't find task 999. Would you like to see your current tasks instead?"
```

## Troubleshooting

### Issue: OpenAI API Key Invalid

**Symptom**:
```
openai.AuthenticationError: Incorrect API key provided
```

**Solution**:
1. Verify key in `.env` starts with `sk-proj-` or `sk-`
2. Check no extra spaces in `.env` file
3. Restart uvicorn to reload environment variables

### Issue: Database Connection Failed

**Symptom**:
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**:
1. Check `DATABASE_URL` in `.env`
2. Verify Neon database is running
3. Check network connectivity
4. Review Phase II setup guide

### Issue: Conversation History Not Fetched

**Symptom**: Agent doesn't remember previous messages

**Solution**:
1. Verify conversation_id passed in request
2. Check messages table has records:
   ```sql
   SELECT * FROM messages WHERE conversation_id = 1;
   ```
3. Check `MessageService.get_recent_history()` implementation

### Issue: MCP Tools Not Found

**Symptom**:
```
ValueError: Unknown tool: add_task
```

**Solution**:
1. Verify MCPServer initialized in `src/mcp/server.py`
2. Check tools registered:
   ```python
   mcp_server.register_tool("add_task", add_task)
   ```
3. Verify import in `src/api/routes/chat.py`

## Performance Monitoring

### Token Usage

Monitor OpenAI API token consumption:

```python
# Add to AgentService.execute()
logger.info(f"Tokens used: {response.usage.total_tokens}")
logger.info(f"Cost estimate: ${response.usage.total_tokens * 0.00002}")
```

### Database Query Performance

Monitor conversation history query time:

```python
# Add to MessageService.get_recent_history()
import time
start = time.time()
messages = await session.execute(query)
logger.info(f"History query took {time.time() - start:.3f}s")
```

### Expected Metrics

- History query: <50ms
- OpenAI API call: 1-3 seconds
- Total chat request: <5 seconds

## Next Steps

1. **Implement Models**: Create `conversation.py` and `message.py`
2. **Implement Repositories**: Create conversation and message data access layers
3. **Implement MCP Tools**: Create 5 stateless tools in `src/mcp/tools/`
4. **Implement Agent Service**: Create OpenAI Agents SDK integration
5. **Implement Chat Endpoint**: Create POST /api/{user_id}/chat route
6. **Write Tests**: Unit tests for tools, integration tests for chat endpoint
7. **Manual Testing**: Use curl or Postman to test conversations
8. **Performance Testing**: Validate <5 second response times

## References

- **Specification**: `specs/004-ai-chatbot/spec.md`
- **Plan**: `specs/004-ai-chatbot/plan.md`
- **Research**: `specs/004-ai-chatbot/research.md`
- **Data Model**: `specs/004-ai-chatbot/data-model.md`
- **API Contracts**: `specs/004-ai-chatbot/contracts/`
- **Constitution**: `.specify/memory/constitution.md` (Section VI)
- **OpenAI Agents SDK Docs**: https://platform.openai.com/docs/guides/function-calling
- **MCP SDK Docs**: https://modelcontextprotocol.io/docs
