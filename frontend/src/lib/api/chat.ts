/**
 * Chat API client functions
 */

import { apiClient } from './client';
import type { ChatRequest, ChatResponse } from '../types/chat';

export const chatApi = {
  /**
   * Send a message to the chat bot
   * POST /api/chat
   */
  sendMessage: async (
    request: ChatRequest
  ): Promise<ChatResponse> => {
    return apiClient.post<ChatResponse>(`/api/chat`, request);
  },
};
