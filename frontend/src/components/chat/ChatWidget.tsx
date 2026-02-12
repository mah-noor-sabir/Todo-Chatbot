/**
 * Chat widget wrapper component
 * Manages chat button and panel state
 * Only displays when user is authenticated
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    lastChatbotUpdate: number;
  }
}

export default function ChatWidget() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Counter to prevent race conditions with multiple simultaneous updates
  const [updateCounter, setUpdateCounter] = useState(0);

  // Ensure CSS variables are available globally and initialize window properties
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Initialize the lastChatbotUpdate property if it doesn't exist
      if (!window.hasOwnProperty('lastChatbotUpdate')) {
        window.lastChatbotUpdate = 0;
      }

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

  // Track the last processed update ID to prevent redundant updates
  const lastProcessedUpdateId = useRef<number | null>(null);

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

  // Prevent multiple rapid updates by tracking the last processed update
  useEffect(() => {
    const handleTodoUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { updateId, timestamp } = customEvent.detail || {};

      // Skip if this update was already processed
      if (updateId !== undefined && lastProcessedUpdateId.current === updateId) {
        return;
      }

      // Update the last processed ID
      lastProcessedUpdateId.current = updateId;

      // Additional debounce: ignore events that are too close together
      if (typeof window !== 'undefined') {
        const now = Date.now();
        if (now - (window.lastChatbotUpdate || 0) < 300) { // 300ms debounce
          return;
        }
        window.lastChatbotUpdate = now;
      }

      // Refresh todos after a small delay to allow for batch operations
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('chatbotTodoUpdateProcessed', { detail: { updateId, timestamp } }));
        }
      }, 100);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('chatbotTodoUpdate', handleTodoUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('chatbotTodoUpdate', handleTodoUpdate);
      }
    };
  }, []);

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
            // Include a unique counter to differentiate between update requests
            window.dispatchEvent(new CustomEvent('chatbotTodoUpdate', { 
              detail: { 
                toolName,
                timestamp: Date.now(),
                updateId: updateCounter
              } 
            }));
            setUpdateCounter(prev => prev + 1); // Increment for next event
          }
        }}
      />
    </>
  );
}
