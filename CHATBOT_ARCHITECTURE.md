# 🏗️ Chatbot Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App Layout                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │             ClientLayout                            │  │  │
│  │  │  ┌──────────────────┐  ┌────────────────────────┐  │  │  │
│  │  │  │  AuthProvider    │  │    Page Content        │  │  │  │
│  │  │  │  (User Context)  │  │    (Todos UI)          │  │  │  │
│  │  │  └──────────────────┘  └────────────────────────┘  │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │          ChatWidget                          │  │  │  │
│  │  │  │  ┌──────────────┐  ┌───────────────────┐   │  │  │  │
│  │  │  │  │ ChatButton   │  │   ChatPanel       │   │  │  │  │
│  │  │  │  │ (Floating)   │─▶│   (Modal)         │   │  │  │  │
│  │  │  │  └──────────────┘  └───────────────────┘   │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /{user_id}/chat
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (FastAPI)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Chat Route Handler                        │ │
│  │                  (routes/chat.py)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              ConversationService                            │ │
│  │  • Get or create conversation                              │ │
│  │  • Manage conversation state                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               MessageService                                │ │
│  │  • Store user message                                       │ │
│  │  • Store assistant response                                 │ │
│  │  • Retrieve conversation history                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  AgentService                               │ │
│  │  • Execute AI agent with history                            │ │
│  │  • Call MCP tools (create/update/delete todos)             │ │
│  │  • Generate natural language responses                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Database                                 │ │
│  │  • conversations table                                      │ │
│  │  • messages table                                           │ │
│  │  • todos table                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
ChatWidget
├── ChatButton
│   ├── Icon (SVG)
│   ├── Unread Badge
│   └── Tooltip
│
└── ChatPanel
    ├── ChatHeader
    │   ├── Bot Avatar
    │   ├── Title & Subtitle
    │   ├── Clear Button
    │   └── Close Button
    │
    ├── ChatMessages (scrollable)
    │   ├── Empty State
    │   ├── ChatMessage (user)
    │   │   ├── Avatar
    │   │   ├── Message Bubble
    │   │   └── Timestamp
    │   │
    │   ├── ChatMessage (assistant)
    │   │   ├── Avatar
    │   │   ├── Message Bubble
    │   │   └── Timestamp
    │   │
    │   └── TypingIndicator
    │       └── Animated Dots
    │
    ├── Error Display
    │
    └── Chat Input Container
        ├── Textarea (multi-line)
        └── Send Button
            └── Icon / Spinner
```

## Data Flow

### 1. Sending a Message

```
User Types Message
       ↓
ChatPanel.handleSend()
       ↓
useChat.sendMessage()
       ↓
[Optimistic Update]
Add user message to state immediately
       ↓
chatApi.sendMessage(userId, request)
       ↓
Backend: POST /{user_id}/chat
       ↓
Backend: Process message with AI agent
       ↓
Backend: Return ChatResponse
       ↓
useChat: Update state with bot response
       ↓
ChatPanel: Re-render with new messages
       ↓
Auto-scroll to bottom
```

### 2. Message State Management

```typescript
// useChat Hook State
{
  messages: [
    { id: 1, role: 'user', content: 'Show my todos', created_at: '...' },
    { id: 2, role: 'assistant', content: 'Here are your todos...', created_at: '...' }
  ],
  loading: false,
  error: null,
  conversationId: 42,
  isTyping: false
}
```

### 3. API Request/Response

**Request:**
```json
POST /1/chat
{
  "message": "Add a new todo: Buy groceries",
  "conversation_id": 42
}
```

**Response:**
```json
{
  "conversation_id": 42,
  "response": "I've added a new todo: 'Buy groceries' with medium priority.",
  "tool_calls": [
    {
      "tool": "create_todo",
      "arguments": {
        "title": "Buy groceries",
        "priority": "medium"
      },
      "result": {
        "id": 123,
        "title": "Buy groceries",
        "is_completed": false
      }
    }
  ]
}
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                           │
│  Provides: { user, setUser, isAuthenticated }           │
└─────────────────────────────────────────────────────────┘
                        ↓ (user.id)
┌─────────────────────────────────────────────────────────┐
│                     useChat Hook                         │
│  Manages:                                                │
│    • messages: Message[]                                │
│    • loading: boolean                                   │
│    • error: string | null                               │
│    • conversationId: number | null                      │
│    • isTyping: boolean                                  │
│                                                          │
│  Methods:                                                │
│    • sendMessage(content: string)                       │
│    • clearMessages()                                    │
└─────────────────────────────────────────────────────────┘
                        ↓ (props)
┌─────────────────────────────────────────────────────────┐
│                    ChatPanel                             │
│  Local State:                                            │
│    • inputValue: string                                 │
│                                                          │
│  Refs:                                                   │
│    • messagesEndRef (auto-scroll)                       │
│    • inputRef (focus management)                        │
└─────────────────────────────────────────────────────────┘
```

## Styling Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 Global Styles                             │
│  • tailwind.css (Tailwind utilities)                     │
│  • globals.css (Theme variables)                         │
└──────────────────────────────────────────────────────────┘
                        ↓ (inherited)
┌──────────────────────────────────────────────────────────┐
│               Component Styles                            │
│  • ChatButton.css (Floating button styles)               │
│  • ChatPanel.css (Modal panel styles)                    │
│  • ChatMessage.css (Message bubble styles)               │
│  • TypingIndicator.css (Animation styles)                │
│                                                           │
│  Common Classes:                                          │
│    .glass-effect     (Glass-morphism)                    │
│    .chat-overlay     (Modal backdrop)                    │
│    .chat-float-btn   (Floating button)                   │
│    .chat-panel       (Main panel)                        │
│    .chat-message     (Message wrapper)                   │
└──────────────────────────────────────────────────────────┘
```

## Performance Optimization

### 1. Optimistic Updates
```
User Action → Immediate UI Update → API Call → Confirm/Rollback
     ↓              ↓                  ↓             ↓
  Click Send   Show message      Backend call    Success: Keep
                instantly                         Failure: Remove
```

### 2. Render Optimization
```
ChatPanel (re-renders when messages change)
    ↓
ChatMessage (React.memo - only re-renders if message changes)
    ↓
Prevents unnecessary re-renders of all messages
```

### 3. Scroll Optimization
```
useEffect with [messages, isTyping] dependency
    ↓
Only scroll when new messages arrive
    ↓
Smooth scroll behavior (not instant)
```

## Security Model

```
Frontend
    ↓ (Include credentials)
Backend Middleware
    ↓ (Verify JWT cookie)
Auth Middleware
    ↓ (Get current user)
Route Handler
    ↓ (Verify user_id matches)
Services
    ↓ (Process request)
Database
    ↓ (Store data with user_id)
```

## Error Handling

```
Try
├── Send message to API
│   ├── Success
│   │   └── Update state with response
│   │
│   └── Failure
│       ├── Remove optimistic message
│       ├── Show error message
│       └── Rollback state
│
└── Catch
    └── Display user-friendly error
```

## Mobile Responsiveness

```
Desktop (> 640px)          Mobile (< 640px)
┌──────────────┐          ┌──────────────────┐
│              │          │                  │
│   Page       │          │                  │
│   Content    │          │    Full Screen   │
│              │          │    Chat Panel    │
│              │          │                  │
│  ┌────────┐ │          │                  │
│  │ [Chat] │ │          │                  │
│  └────────┘ │          │                  │
└──────────────┘          └──────────────────┘
  Fixed 420x600px          100% width/height
  Bottom-right corner      No overlay
```

## Integration Points

```
1. Root Layout (layout.tsx)
   └── Imports ClientLayout

2. ClientLayout (ClientLayout.tsx)
   ├── Wraps with AuthProvider
   └── Adds ChatWidget

3. ChatWidget (ChatWidget.tsx)
   ├── Renders ChatButton (when closed)
   └── Renders ChatPanel (when open)

4. AuthProvider (AuthContext.tsx)
   └── Provides user.id to useChat hook

5. useChat Hook (useChat.ts)
   └── Calls chatApi.sendMessage()

6. Chat API (chat.ts)
   └── Makes POST request to backend
```

---

## Quick Reference Commands

### Start the app:
```bash
# Backend
cd backend && python -m uvicorn src.main:app --reload --port 8001

# Frontend
cd frontend && npm run dev
```

### Test the chatbot:
1. Click floating button (bottom-right)
2. Type: "Show me my todos"
3. Press Enter or click Send
4. Bot responds with your todos

---

**That's the complete architecture!** The chatbot is now fully integrated into your Todo app with a clean, maintainable structure. 🎉
