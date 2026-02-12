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

import { useState } from 'react';

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
            <span
              className="avatar-icon tick-logo"
              title="Tasklyn Bot"
            >
              ✔
            </span>
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
        
        {/* Copy button for assistant messages */}
        {!isUser && !isSystem && (
          <button
            className="message-copy-btn"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy message"}
            aria-label={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
