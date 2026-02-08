/**
 * Chat and conversation types
 */

export interface Message {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface ToolCallResult {
  tool: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCallResult[];
}
