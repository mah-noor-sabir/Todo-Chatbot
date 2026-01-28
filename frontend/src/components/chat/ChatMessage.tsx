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
  const isSystem = message.role === 'system';

  return (
    <div
      className={`chat-message ${isUser ? 'user' : isSystem ? 'system' : 'assistant'}`}
      role="listitem"
      aria-label={isUser ? 'User message' : isSystem ? 'System notification' : 'Assistant message'}
    >
      {!isSystem && (
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
            <img
              className="avatar-icon"
              src="/download (2).jpg"
              alt="Tasklyn Bot"
              width="20"
              height="20"
            />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="message-bubble">
        <div className="message-content">
          {message.content}
        </div>

        {message.created_at && !isSystem && (
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
