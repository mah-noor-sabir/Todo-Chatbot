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
      style={{
        '--bg-main': '#05060a',
        '--bg-layer': '#0b1020',
        '--bg-card': 'rgba(255, 255, 255, 0.05)',
        '--blue-400': '#60a5fa',
        '--blue-500': '#3b82f6',
        '--blue-600': '#2563eb',
        '--text-primary': '#ffffff',
        '--text-muted': '#94a3b8',
        '--glass-bg': 'rgba(15, 23, 42, 0.6)',
        '--glass-border': 'rgba(59, 130, 246, 0.2)',
        '--radius-lg': '1rem',
        '--radius-md': '0.75rem',
        '--shadow-soft': '0 20px 40px rgba(0, 0, 0, 0.35)',
      } as React.CSSProperties}
    >
      {/* Unread indicator */}
      {hasUnread && <span className="chat-unread-badge" aria-hidden="true" />}

      {/* Bot / Message Icon */}
      <span className="chat-icon">
        ✔
      </span>

      {/* Tooltip */}
      <span className="chat-tooltip">Chat with Taskify Assistant</span>
    </button>
  );
}
