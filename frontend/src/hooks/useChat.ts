/**
 * useChat
 * ----------
 * Centralized chat state manager with:
 * - Optimistic message updates
 * - Conversation lifecycle tracking
 * - Bot typing indicator
 * - Tool-call side effects (todo sync)
 * - System message injection
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
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  addSystemMessage: (content: string) => void;
}

export function useChat(
  userId: number | undefined,
  onToolCall?: (toolName: string) => void,
  onRefreshTodos?: () => void
): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Local counter used to generate temporary negative IDs
   * for optimistic messages before backend confirmation.
   */
  const tempIdCounter = useRef(0);

  /**
   * Sends a user message to the chat API with optimistic UI updates.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim()) return;

      const tempId = --tempIdCounter.current;

      const optimisticUserMessage: Message = {
        id: tempId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      try {
        setError(null);
        setLoading(true);
        setIsTyping(true);

        // Optimistically render user message
        setMessages((prev) => [...prev, optimisticUserMessage]);

        const payload: ChatRequest = {
          message: content.trim(),
          conversation_id: conversationId,
        };

        const response = await chatApi.sendMessage(payload);

        // Initialize conversation on first message
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        const assistantMessage: Message = {
          id: --tempIdCounter.current,
          role: 'assistant',
          content: response.response,
          created_at: new Date().toISOString(),
        };

        // Add assistant message to the conversation
        setMessages((prev) => [
          ...prev,
          assistantMessage,
        ]);

        // Notify consumers if chat tools mutated todos
        if (Array.isArray(response.tool_calls)) {
          response.tool_calls.forEach((call) => {
            if (
              [
                'add_task',
                'update_task',
                'delete_task',
                'complete_task',
              ].includes(call.tool)
            ) {
              onToolCall?.(call.tool);
              // Refresh todos to sync with backend changes
              onRefreshTodos?.();
            }
          });
        }
      } catch (err) {
        // Roll back optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));

        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Unable to send message. Please try again.');
        }

        throw err;
      } finally {
        setIsTyping(false);
        setLoading(false);
      }
    },
    [userId, conversationId, onToolCall]
  );

  /**
   * Clears chat history and resets conversation state.
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setIsTyping(false);
  }, []);

  /**
   * Injects a system-level message into the chat timeline.
   */
  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: --tempIdCounter.current,
      role: 'system',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  /**
   * Listens for external todo mutations (UI-driven)
   * and mirrors them as system messages in chat.
   */
  useEffect(() => {
    const handler = (event: Event) => {
      const { action, todo, id } = (event as CustomEvent).detail;

      const messagesByAction: Record<string, string> = {
        add_task: `User added a new task: "${todo?.title}"`,
        update_task: `User updated task with ID ${id}`,
        delete_task: `User deleted task with ID ${id}`,
        complete_task: `User completed task with ID ${id}`,
        uncomplete_task: `User marked task ${id} as incomplete`,
      };

      addSystemMessage(
        messagesByAction[action] ??
          `User performed task action: ${action}`
      );
    };

    window.addEventListener('manualTodoUpdate', handler);
    return () => window.removeEventListener('manualTodoUpdate', handler);
  }, [addSystemMessage]);

  return {
    messages,
    loading,
    error,
    conversationId,
    isTyping,
    sendMessage,
    clearMessages,
    addSystemMessage,
  };
}
