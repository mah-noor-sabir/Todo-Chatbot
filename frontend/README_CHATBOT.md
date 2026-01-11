# 🤖 Chatbot Quick Reference

## File Structure

```
frontend/src/
├── lib/
│   ├── types/
│   │   └── chat.ts              # Chat type definitions
│   └── api/
│       └── chat.ts              # Chat API client
├── hooks/
│   └── useChat.ts               # Chat state management hook
├── components/
│   └── chat/
│       ├── ChatWidget.tsx       # Main wrapper component
│       ├── ChatButton.tsx       # Floating button
│       ├── ChatButton.css       # Button styles
│       ├── ChatPanel.tsx        # Chat modal interface
│       ├── ChatPanel.css        # Panel styles
│       ├── ChatMessage.tsx      # Message component
│       ├── ChatMessage.css      # Message styles
│       ├── TypingIndicator.tsx  # Typing animation
│       └── TypingIndicator.css  # Typing styles
└── app/
    ├── ClientLayout.tsx         # Client-side layout wrapper
    └── layout.tsx               # Root layout (updated)
```

## Component Usage

### ChatWidget (Main Component)
```tsx
import ChatWidget from '@/components/chat/ChatWidget';

// In your layout or page
<ChatWidget />
```

### useChat Hook
```tsx
import { useChat } from '@/hooks/useChat';

const {
  messages,        // Array of chat messages
  loading,         // Is API call in progress?
  error,           // Error message if any
  conversationId,  // Current conversation ID
  sendMessage,     // Function to send message
  clearMessages,   // Function to clear history
  isTyping,        // Is bot typing?
} = useChat(userId);

// Send a message
await sendMessage("Show me my todos");

// Clear chat
clearMessages();
```

## API Reference

### chatApi.sendMessage()
```typescript
import { chatApi } from '@/lib/api/chat';

const response = await chatApi.sendMessage(userId, {
  message: "Add a new todo: Buy milk",
  conversation_id: conversationId || null
});

// Response structure:
{
  conversation_id: number,
  response: string,
  tool_calls: ToolCallResult[]
}
```

## Styling Classes

### Key CSS Classes
```css
.chat-float-btn        /* Floating button */
.chat-panel            /* Main chat modal */
.chat-message          /* Individual message */
.chat-message.user     /* User message (right) */
.chat-message.assistant /* Bot message (left) */
.typing-indicator      /* Typing animation */
.glass-effect          /* Glass-morphism effect */
```

### Color Variables (Matches Your Theme)
```css
--primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
--bg-panel: rgba(15, 23, 42, 0.95);
--border-light: rgba(255, 255, 255, 0.1);
--text-primary: #f8fafc;
--text-secondary: rgba(255, 255, 255, 0.6);
```

## Example Commands

### Todo Management
```
"Show me all my todos"
"Add a new todo: Complete project documentation"
"Mark my first todo as complete"
"Delete the todo about groceries"
"What are my high priority tasks?"
"Show me incomplete todos"
"List todos tagged with 'work'"
```

### Natural Language
The bot understands natural language, so you can ask:
```
"What do I need to do today?"
"Help me organize my tasks"
"Remind me about urgent items"
"What's left on my todo list?"
```

## Testing

### Manual Testing Checklist
- [ ] Chat button appears in bottom-right
- [ ] Clicking button opens chat panel
- [ ] Can send messages
- [ ] Bot responds correctly
- [ ] Messages display properly (user right, bot left)
- [ ] Typing indicator shows during response
- [ ] Can clear chat history
- [ ] Can close chat panel
- [ ] Error messages display correctly
- [ ] Works on mobile (full screen)
- [ ] Hover effects work on desktop

### Browser DevTools Testing
```javascript
// Check if ChatWidget is mounted
document.querySelector('.chat-float-btn')

// Check for errors in console
// Network tab: Verify POST /{user_id}/chat requests

// React DevTools: Check useChat hook state
```

## Common Customizations

### Change Chat Button Position
```css
/* In ChatButton.css */
.chat-float-btn {
  bottom: 24px;  /* Change this */
  right: 24px;   /* Change this */
}
```

### Change Panel Size
```css
/* In ChatPanel.css */
.chat-panel {
  width: 420px;   /* Change this */
  height: 600px;  /* Change this */
}
```

### Change Colors
```css
/* In ChatButton.css and ChatPanel.css */
.chat-float-btn {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Modify Message Max Length
```tsx
// In ChatPanel.tsx
<textarea
  maxLength={2000}  // Change this
/>
```

## Troubleshooting

### Issue: Chat button not showing
**Solution:** Ensure you're authenticated and ClientLayout wraps your app

### Issue: Messages not sending
**Solution:** Check backend is running on port 8001

### Issue: Styles not applying
**Solution:** Clear Next.js cache and restart dev server

### Issue: TypeScript errors
**Solution:** Run `npm run type-check` and fix import paths

## Performance Tips

1. **Lazy Load Chat**: Import ChatWidget dynamically if needed
   ```tsx
   const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), {
     ssr: false
   });
   ```

2. **Memoize Messages**: Already implemented in ChatMessage component

3. **Debounce Input**: Already handled in useChat hook

4. **Limit Message History**: Set a max in useChat if needed

## Accessibility

- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatible
- ✅ Semantic HTML structure

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

All dependencies are already in your `package.json`:
- React 18.2.0
- Next.js 14.1.0
- TypeScript 5.9.3
- No additional packages needed!

---

**That's it! Your chatbot is fully integrated and ready to use.** 🎉
