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

  // Debug logging for disappearing chatbot
  useEffect(() => {
    console.log('[ChatWidget] State changed:', {
      isLoading,
      isAuthenticated,
      isChatOpen,
      timestamp: new Date().toISOString()
    });
  }, [isLoading, isAuthenticated, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Don't render anything while checking auth status
  if (isLoading) {
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
          window.dispatchEvent(new CustomEvent('chatbotTodoUpdate', { detail: { toolName } }));
        }}
      />
    </>
  );
}
