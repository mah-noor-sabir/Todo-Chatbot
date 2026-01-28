/**
 * useMultiChat
 * ----------
 * Centralized multi-chat state manager with:
 * - Chat session management
 * - Local storage persistence
 * - Conversation history
 * - Welcome message injection
 * - Optimistic message updates
 * - Tool-call side effects (todo sync)
 * - System message injection
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatApi } from '../lib/api/chat';
import type { Message, ChatRequest } from '../lib/types/chat';
import { ApiClientError } from '../lib/api/client';

interface ChatSession {
  id: string;
  createdAt: Date;
  title: string;
  messages: Message[];
  conversationId?: number; // Backend conversation ID
}

interface UseMultiChatReturn {
  chats: ChatSession[];
  activeChatId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  addSystemMessage: (content: string) => void;
}

export function useMultiChat(
  userId: number | undefined,
  userName: string | undefined,
  onToolCall?: (toolName: string) => void
): UseMultiChatReturn {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to hold current state values
  const chatsRef = useRef(chats);
  const activeChatIdRef = useRef(activeChatId);

  // Update refs when state changes
  useEffect(() => {
    chatsRef.current = chats;
    activeChatIdRef.current = activeChatId;
  }, [chats, activeChatId]);

  // Load chats from localStorage on initialization
  useEffect(() => {
    const storedData = localStorage.getItem('taskify-chats');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Convert date strings back to Date objects
        const loadedChats = parsed.chats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            created_at: msg.created_at ? new Date(msg.created_at) : new Date().toISOString()
          }))
        }));
        setChats(loadedChats);
        setActiveChatId(parsed.activeChatId || null);
      } catch (e) {
        console.error('Failed to load chats from localStorage:', e);
        // Initialize with empty state if parsing fails
        setChats([]);
        setActiveChatId(null);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    const dataToSave = {
      chats,
      activeChatId
    };
    localStorage.setItem('taskify-chats', JSON.stringify(dataToSave));
  }, [chats, activeChatId]);

  /**
   * Gets the currently active chat using current state from refs
   */
  const getActiveChat = useCallback(() => {
    return chatsRef.current.find(chat => chat.id === activeChatIdRef.current);
  }, []);

  /**
   * Gets messages from the active chat using current state from refs
   */
  const getActiveChatMessages = useCallback(() => {
    const activeChat = getActiveChat();
    return activeChat ? activeChat.messages : [];
  }, [getActiveChat]);

  /**
   * Creates a new chat session
   */
  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      createdAt: new Date(),
      title: 'New Chat',
      messages: []
    };

    setChats(prev => [newChat, ...prev]); // Add to beginning of list
    setActiveChatId(newChatId);
  }, []);

  /**
   * Switches to a different chat
   */
  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  /**
   * Deletes a chat
   */
  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));

    // If we're deleting the active chat, switch to the first available chat
    if (activeChatIdRef.current === chatId) {
      const remainingChats = chatsRef.current.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  }, []);

  /**
   * Updates a chat's properties
   */
  const updateChat = useCallback((chatId: string, updates: Partial<ChatSession>) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, ...updates }
          : chat
      )
    );
  }, []);

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
      if (!userId || !content.trim() || !activeChatIdRef.current) return;

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

        // Optimistically add user message to active chat
        const currentMessages = getActiveChatMessages();
        const currentChatState = chatsRef.current.find(chat => chat.id === activeChatIdRef.current);
        const isFirstMessageInChat = currentMessages.length === 0;
        const isNewChatWithTitlePlaceholder = currentChatState?.title === 'New Chat';

        updateChat(activeChatIdRef.current, {
          messages: [...currentMessages, optimisticUserMessage],
          // Set title to first user message if it's the first message in the chat or chat still has placeholder title
          title: isFirstMessageInChat || isNewChatWithTitlePlaceholder
            ? content.trim().substring(0, 30) + (content.trim().length > 30 ? '...' : '')
            : currentChatState?.title
        });

        const currentChat = chatsRef.current.find(chat => chat.id === activeChatIdRef.current);
        const payload: ChatRequest = {
          message: content.trim(),
          conversation_id: currentChat?.conversationId || null,
        };

        const response = await chatApi.sendMessage(userId, payload);

        // Initialize conversation on first message if needed
        if (!currentChat?.conversationId) {
          updateChat(activeChatIdRef.current, {
            conversationId: response.conversation_id
          });
        }

        const assistantMessage: Message = {
          id: --tempIdCounter.current,
          role: 'assistant',
          content: response.response,
          created_at: new Date().toISOString(),
        };

        // Update chat with assistant response
        updateChat(activeChatIdRef.current, {
          messages: [
            ...currentMessages.filter((m) => m.id !== tempId),
            optimisticUserMessage,
            assistantMessage,
          ]
        });

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
            }
          });
        }
      } catch (err) {
        // Roll back optimistic message on failure
        const currentMessages = getActiveChatMessages();
        updateChat(activeChatIdRef.current, {
          messages: currentMessages.filter((m) => m.id !== tempId)
        });

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
    [userId, getActiveChatMessages, updateChat, onToolCall]
  );

  /**
   * Injects a system-level message into the active chat timeline.
   */
  const addSystemMessage = useCallback((content: string) => {
    if (!activeChatIdRef.current) return;

    const systemMessage: Message = {
      id: --tempIdCounter.current,
      role: 'system',
      content,
      created_at: new Date().toISOString(),
    };

    const currentMessages = getActiveChatMessages();
    updateChat(activeChatIdRef.current, {
      messages: [...currentMessages, systemMessage]
    });
  }, [getActiveChatMessages, updateChat]);

  /**
   * Injects the welcome message for the active chat if it doesn't already have messages
   */
  useEffect(() => {
    const activeChat = getActiveChat();
    if (activeChatIdRef.current && activeChat && activeChat.messages.length === 0 && userId) {
      // Use the user's name in the welcome message
      const welcomeMessage = userName
        ? `Hi ${userName}, I'm Tasklyn — here to help you manage your tasks efficiently.`
        : "Hi, I'm Tasklyn — here to help you manage your tasks efficiently.";

      setTimeout(() => {
        addSystemMessage(welcomeMessage);
      }, 500); // Small delay to ensure the chat is fully initialized
    }
  }, [getActiveChat, userId, userName, addSystemMessage]);

  return {
    chats,
    activeChatId,
    messages: getActiveChatMessages(), // Provide current messages
    loading,
    error,
    isTyping,
    sendMessage,
    createNewChat,
    switchChat,
    deleteChat,
    addSystemMessage,
  };
}