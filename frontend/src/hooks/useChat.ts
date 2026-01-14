/**
 * Chat state management hook
 * Handles conversation state and message sending with optimistic updates
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatApi } from '../lib/api/chat';
import type { Message, ChatRequest } from '../lib/types/chat';
import { ApiClientError } from '../lib/api/client';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  conversationId: number | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  isTyping: boolean;
}

export function useChat(userId: number | undefined, onToolCall?: (toolName: string) => void): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Use ref to track message counter for temporary IDs
  const messageIdCounter = useRef(0);

  // Send a message to the bot
  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim()) return;

      const tempId = --messageIdCounter.current;

      // Create optimistic user message
      const userMessage: Message = {
        id: tempId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      try {
        setError(null);
        setLoading(true);

        // Optimistically add user message
        setMessages((prev) => [...prev, userMessage]);

        // Show typing indicator
        setIsTyping(true);

        const request: ChatRequest = {
          message: content.trim(),
          conversation_id: conversationId,
        };

        const response = await chatApi.sendMessage(userId, request);

        // Update conversation ID if first message
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add assistant response
        const assistantMessage: Message = {
          id: --messageIdCounter.current,
          role: 'assistant',
          content: response.response,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => {
          // Replace temp user message with confirmed one and add bot response
          return [...prev.filter((m) => m.id !== tempId), userMessage, assistantMessage];
        });

        // Check if any tool calls were made that affect todos
        // NOTE: We don't trigger refresh anymore since todos use optimistic updates
        if (response.tool_calls && Array.isArray(response.tool_calls)) {
          for (const toolCall of response.tool_calls) {
            if (toolCall.tool === 'add_task' || toolCall.tool === 'update_task' || toolCall.tool === 'complete_task' || toolCall.tool === 'delete_task') {
              onToolCall?.(toolCall.tool);
            }
          }
        }

        setIsTyping(false);
      } catch (err) {
        setIsTyping(false);

        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));

        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Failed to send message. Please try again.');
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, conversationId]
  );

  // Clear all messages and reset conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setIsTyping(false);
  }, []);

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    isTyping,
  };
}
