/**
 * Chat widget wrapper component
 * Manages chat button and panel state
 * Only displays when user is authenticated
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Ensure CSS variables are available globally
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const rootStyles = {
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
      };

      Object.entries(rootStyles).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }
  }, []);

  // Debug logging for disappearing chatbot
  useEffect(() => {
    // Only log in development and browser environment
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('[ChatWidget] State changed:', {
        isLoading,
        isAuthenticated,
        isChatOpen,
        timestamp: new Date().toISOString()
      });
    }
  }, [isLoading, isAuthenticated, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Don't render anything while checking auth status or if not in browser
  if (isLoading || typeof window === 'undefined') {
    return null;
  }

  // Only show chat widget when user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {!isChatOpen && <ChatButton onClick={handleOpenChat} />}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        onToolCall={(toolName) => {
          // Trigger a global event to notify the Todo UI about changes
          // This ensures the Todo UI updates when chatbot modifies todos
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chatbotTodoUpdate', { detail: { toolName } }));
          }
        }}
      />
    </>
  );
}
