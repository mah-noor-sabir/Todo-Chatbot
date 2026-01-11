/**
 * ChatButton Component
 * -------------------
 * Floating action button that opens the Todo Assistant chat.
 * Positioned fixed at the bottom-right with hover and unread states.
 */

'use client';

import { useState } from 'react';
import './ChatButton.css';

interface ChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export default function ChatButton({
  onClick,
  hasUnread = false,
}: ChatButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className="chat-float-btn"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Open Todo Assistant"
    >
      {/* Unread indicator */}
      {hasUnread && <span className="chat-unread-badge" aria-hidden="true" />}

      {/* Bot / Message Icon */}
      <svg
        className="chat-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        {hovered ? (
          /* Message icon (hover state) */
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01
               M21 12c0 4.418-4.03 8-9 8
               a9.863 9.863 0 01-4.255-.949L3 20
               l1.395-3.72C3.512 15.042 3 13.574 3 12
               c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        ) : (
          /* Bot icon (default state) */
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673
               M12 3v1
               m6.364 1.636-.707.707
               M21 12h-1
               M4 12H3
               m3.343-5.657-.707-.707
               m2.828 9.9a5 5 0 117.072 0
               l-.548.547A3.374 3.374 0 0014 18.469V19
               a2 2 0 11-4 0v-.531
               c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        )}
      </svg>

      {/* Tooltip */}
      <span className="chat-tooltip">Chat with Todo Assistant</span>
    </button>
  );
}
