/**
 * ChatPanel Component
 * ------------------
 * Compact Todo Assistant chat panel with simplified history and new chat layout.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useMultiChat } from '../../hooks/useMultiChat';
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
    chats,
    activeChatId,
    messages,
    loading,
    error,
    sendMessage,
    createNewChat,
    switchChat,
    deleteChat,
    isTyping,
    addSystemMessage,
  } = useMultiChat(user?.id, user?.first_name || user?.email?.split('@')[0], onToolCall);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (chats.length === 0 && isOpen && user) createNewChat();
  }, [chats.length, isOpen, user, createNewChat]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="chat-overlay" 
      onClick={handleOverlayClick}
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
      <div className="chat-panel glass-effect" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-bot-avatar">
            <span
              className="chat-logo-span"
              title="Taskify Assistant"
            >
              ✔
            </span>
          </div>
          <div className="chat-header-text">
            <h3>Tasklyn</h3>
            <p>Your helpful todo assistant</p>
          </div>
          <div className="chat-header-actions">
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

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className="message-container">
              <ChatMessage message={message} />
              {message.role === 'assistant' && (
                <button
                  type="button"
                  className="message-delete-btn"
                  onClick={() => {
                    // Add functionality to delete this message
                    // For now, we'll just log the action
                    console.log(`Deleting message: ${message.id}`);
                  }}
                  aria-label="Delete message"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
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
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
