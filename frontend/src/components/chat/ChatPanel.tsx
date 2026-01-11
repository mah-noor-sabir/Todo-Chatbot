/**
 * ChatPanel Component
 * ------------------
 * Primary conversational interface for the Todo Assistant.
 * Manages message flow, user input, scrolling behavior,
 * and overall chat lifecycle.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ErrorMessage from '../ui/ErrorMessage';
import './ChatPanel.css';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToolCall?: (toolName: string) => void;
}

export default function ChatPanel({ isOpen, onClose, onToolCall }: ChatPanelProps) {
  const { user } = useAuthContext();
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    isTyping,
  } = useChat(user?.id, onToolCall);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll to newest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Auto-focus input when panel opens */
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  /* Send message */
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || loading) return;

    setInputValue('');
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  /* Enter to send (Shift+Enter for newline) */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Close when clicking outside panel */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={handleOverlayClick}>
      <div
        className="chat-panel glass-effect"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Todo Assistant Chat"
      >
        {/* ===============================
            Header
           =============================== */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-bot-avatar" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1
                     m6.364 1.636-.707.707
                     M21 12h-1M4 12H3
                     m3.343-5.657-.707-.707
                     m2.828 9.9a5 5 0 117.072 0
                     l-.548.547A3.374 3.374 0 0014 18.469V19
                     a2 2 0 11-4 0v-.531
                     c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>

            <div className="chat-header-text">
              <h3 className="chat-title">Todo Assistant</h3>
              <p className="chat-subtitle">
                Helping you stay organized and focused
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button
                type="button"
                className="chat-clear-btn"
                onClick={clearMessages}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862
                       a2 2 0 01-1.995-1.858L5 7
                       m5 4v6m4-6v6
                       m1-10V4a1 1 0 00-1-1h-4
                       a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}

            <button
              type="button"
              className="chat-close-btn"
              onClick={onClose}
              aria-label="Close chat"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ===============================
            Messages
           =============================== */}
        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="chat-empty-state">
              <div className="empty-icon">🤖</div>
              <h4 className="empty-title">Hi, I’m your Todo Assistant</h4>
              <p className="empty-subtitle">
                You can ask me things like:
                <br />
                “Show all my tasks”
                <br />
                “Add a task for tomorrow”
                <br />
                “Mark my first task as completed”
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* ===============================
            Error
           =============================== */}
        {error && (
          <div className="chat-error">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* ===============================
            Input
           =============================== */}
        <div className="chat-input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Try: “Add a task for today”"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            disabled={loading}
          />

          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            aria-label="Send message"
          >
            {loading ? (
              <div className="send-spinner" />
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
