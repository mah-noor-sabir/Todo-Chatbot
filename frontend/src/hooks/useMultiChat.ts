'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { chatApi } from '../lib/api/chat';
import type { Message, ChatRequest } from '../lib/types/chat';
import { ApiClientError } from '../lib/api/client';

interface ChatSession {
  id: string;
  createdAt: string;
  title: string;
  messages: Message[];
  conversationId?: number;
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
  userId?: number,
  userName?: string,
  onToolCall?: (toolName: string) => void,
  onRefreshTodos?: () => void
): UseMultiChatReturn {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tempIdCounter = useRef(0);

  // -----------------------------
  // LocalStorage Load
  // -----------------------------
  useEffect(() => {
    const stored = localStorage.getItem('taskify-chats');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setChats(parsed.chats || []);
      setActiveChatId(parsed.activeChatId || null);
    } catch (e) {
      console.error('Failed to load chats:', e);
      setChats([]);
      setActiveChatId(null);
    }
  }, []);

  // -----------------------------
  // LocalStorage Save
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(
      'taskify-chats',
      JSON.stringify({ chats, activeChatId })
    );
  }, [chats, activeChatId]);

  // -----------------------------
  // Derived active messages
  // -----------------------------
  const messages = useMemo(() => {
    return chats.find(c => c.id === activeChatId)?.messages || [];
  }, [chats, activeChatId]);

  // -----------------------------
  // Chat management
  // -----------------------------
  const createNewChat = useCallback(() => {
    const id = `chat_${Date.now()}`;
    const newChat: ChatSession = {
      id,
      createdAt: new Date().toISOString(),
      title: 'New Chat',
      messages: [],
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(id);
  }, []);

  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId);
      if (activeChatId === chatId) {
        setActiveChatId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeChatId]);

  // -----------------------------
  // Add system message
  // -----------------------------
  const addSystemMessage = useCallback((content: string) => {
    if (!activeChatId) return;

    const message: Message = {
      id: --tempIdCounter.current,
      role: 'system',
      content,
      created_at: new Date().toISOString(),
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  }, [activeChatId]);

  // -----------------------------
  // Send message (FIXED)
  // -----------------------------
  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim() || !activeChatId) return;

    const trimmed = content.trim();
    const tempId = --tempIdCounter.current;

    const userMessage: Message = {
      id: tempId,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setError(null);
    setLoading(true);
    setIsTyping(true);

    // Add user message immediately
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title:
                chat.messages.length === 0 || chat.title === 'New Chat'
                  ? trimmed.slice(0, 30) + (trimmed.length > 30 ? '...' : '')
                  : chat.title,
            }
          : chat
      )
    );

    try {
      const currentChat = chats.find(c => c.id === activeChatId);

      const payload: ChatRequest = {
        message: trimmed,
        conversation_id: currentChat?.conversationId || null,
      };

      const response = await chatApi.sendMessage(payload);

      // Save conversation ID if first message
      if (!currentChat?.conversationId) {
        setChats(prev =>
          prev.map(chat =>
            chat.id === activeChatId
              ? { ...chat, conversationId: response.conversation_id }
              : chat
          )
        );
      }

      const assistantMessage: Message = {
        id: --tempIdCounter.current,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };

      // Add assistant message
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );

      // Tool calls
      response.tool_calls?.forEach(call => {
        if (
          ['add_task', 'update_task', 'delete_task', 'complete_task', 'delete_task_by_name']
            .includes(call.tool)
        ) {
          onToolCall?.(call.tool);
          onRefreshTodos?.();
        }
      });

    } catch (err) {
      // Remove failed user message
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: chat.messages.filter(m => m.id !== tempId),
              }
            : chat
        )
      );

      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Unable to send message. Please try again.'
      );

      throw err;
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }, [userId, activeChatId, chats, onToolCall, onRefreshTodos]);

  // -----------------------------
  // Welcome message
  // -----------------------------
  useEffect(() => {
    if (!activeChatId || !userId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat || chat.messages.length > 0) return;

    const welcome = userName
      ? `Hi ${userName}, I am Tasklyn, your helpful todo assistant.`
      : 'Hi, I am Tasklyn, your helpful todo assistant.';

    const timer = setTimeout(() => {
      addSystemMessage(welcome);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeChatId, chats, userId, userName, addSystemMessage]);

  return {
    chats,
    activeChatId,
    messages,
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
