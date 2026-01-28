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
  const [showHistory, setShowHistory] = useState(false);
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

  /* Initialize with a new chat if none exist */
  useEffect(() => {
    if (chats.length === 0 && isOpen && user) {
      createNewChat();
    }
  }, [chats.length, isOpen, user, createNewChat]);

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
            Header with Floating History Panel
           =============================== */}
        <div className="chat-header">
          <div className="chat-header-content">
            {/* Main Chat Header */}
            <div className="chat-current-info">
              <div className="chat-bot-avatar" aria-hidden="true">
                <img
                  src="/download (2).jpg"
                  alt="Tasklyn Bot"
                  width="22"
                  height="22"
                />
              </div>

              <div className="chat-header-text">
                <h3 className="chat-title">Tasklyn</h3>
                <div className="chat-status">
                  <span className="chat-status-indicator"></span>
                  <span className="chat-status-text">Online</span>
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-history-toggle-btn"
                onClick={() => setShowHistory(!showHistory)}
                title="Show history"
                aria-label="Show history"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

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
        </div>

        {/* Sidebar History Panel */}
        <div className={`chat-sidebar-panel ${showHistory ? 'visible' : ''}`}>
          <div className="chat-sidebar-panel-content">
            <div className="chat-sidebar-panel-header">
              <div className="chat-sidebar-panel-title">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="chat-history-icon">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="chat-history-title">History</h4>
              </div>
              <button
                type="button"
                className="chat-history-close-btn"
                onClick={() => setShowHistory(false)}
                aria-label="Close history"
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

            <div className="chat-history-list">
              {chats.map((chat) => (
                <div key={chat.id} className="chat-history-item-wrapper">
                  <button
                    type="button"
                    className={`chat-history-item ${activeChatId === chat.id ? 'active' : ''}`}
                    onClick={() => {
                      switchChat(chat.id);
                      setShowHistory(false); // Close panel after selecting chat
                    }}
                    title={chat.title}
                  >
                    <div className="chat-history-item-content">
                      <span className="chat-history-title-text">
                        {chat.title}
                      </span>
                      <time className="chat-history-date">
                        {chat.createdAt.toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="chat-history-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the chat selection
                      deleteChat(chat.id);
                    }}
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="chat-sidebar-panel-footer">
              <button
                type="button"
                className="chat-new-btn"
                onClick={createNewChat}
                title="Start new chat"
                aria-label="Start new chat"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Chat
              </button>
            </div>
          </div>
        </div>

        {/* ===============================
            Messages
           =============================== */}
        <div className="chat-messages">
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
