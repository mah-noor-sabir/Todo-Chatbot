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
    deleteChat,
    isTyping,
  } = useMultiChat(
    user?.id,
    user?.first_name || user?.email?.split('@')[0],
    onToolCall,
    () => window.dispatchEvent(new CustomEvent('chatbotTodoUpdate'))
  );

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Initialize new chat if none exist
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
    <div className="chat-overlay" onClick={handleOverlayClick}>
      <div className="chat-panel glass-effect" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="chat-header">
          <h1 className="chat-title">
            <span title="Verified">✔</span> Tasklyn
          </h1>
          <div className="chat-header-actions">
            <button className="chat-delete-btn" onClick={() => activeChatId && deleteChat(activeChatId)} aria-label="Delete chat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && <ErrorMessage message={error} />}

        {/* Input */}
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
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            aria-label="Send message"
          >
            {loading ? (
              <div className="send-spinner" />
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={18} height={18}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
