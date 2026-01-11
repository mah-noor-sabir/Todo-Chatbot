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
          // Refresh the todo list when tasks are modified via chat
          if (['add_task', 'update_task', 'complete_task', 'delete_task'].includes(toolName)) {
            window.dispatchEvent(new CustomEvent('refreshTodos'));
          }
        }}
      />
    </>
  );
}
