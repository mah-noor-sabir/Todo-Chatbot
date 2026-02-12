/**
 * Typing indicator component
 * Shows when bot is processing a response
 */

'use client';

import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="chat-message assistant">
      <div className="message-avatar">
        <span className="avatar-icon" title="Tasklyn Bot">
          ✔
        </span>
      </div>
      <div className="message-bubble">
        <div className="typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
      </div>
    </div>
  );
}
