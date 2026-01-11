/**
 * ChatMessage Component
 * --------------------
 * Displays a single chat message with role-based layout,
 * avatar distinction, and timestamp rendering.
 */

'use client';

import type { Message } from '../../lib/types/chat';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`chat-message ${isUser ? 'user' : 'assistant'}`}
      role="listitem"
      aria-label={isUser ? 'User message' : 'Assistant message'}
    >
      {/* Avatar */}
      <div className="message-avatar" aria-hidden="true">
        {isUser ? (
          <svg
            className="avatar-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            />
          </svg>
        ) : (
          <svg
            className="avatar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="message-bubble">
        <div className="message-content">
          {message.content}
        </div>

        {message.created_at && (
          <div className="message-time">
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
