/**
 * Todo API client with caching and request deduplication
 * Handles CRUD operations for todos
 */

import { apiClient } from './client';
import type {
  Todo,
  TodoCreateRequest,
  TodoUpdateRequest,
} from '../types/todo';

// Simple in-memory cache for API responses
const todoCache = new Map();

// Request deduplication map
const activeRequests = new Map();

// Generate cache key for requests
const getCacheKey = (method: string, url: string, params?: any) => {
  return `${method}:${url}${params ? ':' + JSON.stringify(params) : ''}`;
};

// Check if response is still fresh (5 seconds)
const isCacheFresh = (timestamp: number, ttl: number = 5000) => {
  return Date.now() - timestamp < ttl;
};

export const todosApi = {
  /**
   * Get all todos for the authenticated user
   * GET /todos
   */
  getTodos: async (): Promise<Todo[]> => {
    const cacheKey = getCacheKey('GET', '/todos');

    // Check cache first
    const cached = todoCache.get(cacheKey);
    if (cached && isCacheFresh(cached.timestamp)) {
      return cached.data;
    }

    // Check for active request to prevent duplication
    if (activeRequests.has(cacheKey)) {
      // Return promise of the ongoing request
      return activeRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const data = await apiClient.get<Todo[]>('/todos');

        // Cache the response
        todoCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        return data;
      } finally {
        // Clean up the active request
        activeRequests.delete(cacheKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    activeRequests.set(cacheKey, requestPromise);

    return requestPromise;
  },

  /**
   * Create a new todo
   * POST /todos
   */
  createTodo: async (data: TodoCreateRequest): Promise<Todo> => {
    // Invalidate the cached todo list since we're adding a new item
    todoCache.delete(getCacheKey('GET', '/todos'));

    return await apiClient.post<Todo>('/todos', data);
  },

  /**
   * Get a single todo by ID
   * GET /todos/:id
   */
  getTodoById: async (id: number): Promise<Todo> => {
    const cacheKey = getCacheKey('GET', `/todos/${id}`);

    // Check cache first
    const cached = todoCache.get(cacheKey);
    if (cached && isCacheFresh(cached.timestamp)) {
      return cached.data;
    }

    const data = await apiClient.get<Todo>(`/todos/${id}`);

    // Cache the response
    todoCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  },

  /**
   * Update todo title and description
   * PUT /todos/:id
   */
  updateTodo: async (id: number, data: TodoUpdateRequest): Promise<Todo> => {
    // Invalidate the cached todo list since we're modifying an item
    todoCache.delete(getCacheKey('GET', '/todos'));

    // Also invalidate the specific todo cache
    todoCache.delete(getCacheKey('GET', `/todos/${id}`));

    return await apiClient.put<Todo>(`/todos/${id}`, data);
  },

  /**
   * Toggle todo completion status
   * PATCH /todos/:id
   */
  toggleCompletion: async (id: number, is_completed: boolean): Promise<Todo> => {
    // Invalidate the cached todo list since we're modifying an item
    todoCache.delete(getCacheKey('GET', '/todos'));

    // Also invalidate the specific todo cache
    todoCache.delete(getCacheKey('GET', `/todos/${id}`));

    return await apiClient.patch<Todo>(`/todos/${id}`, { is_completed });
  },

  /**
   * Delete todo
   * DELETE /todos/:id
   */
  deleteTodo: async (id: number): Promise<void> => {
    // Invalidate the cached todo list since we're removing an item
    todoCache.delete(getCacheKey('GET', '/todos'));

    // Also invalidate the specific todo cache
    todoCache.delete(getCacheKey('GET', `/todos/${id}`));

    await apiClient.delete<void>(`/todos/${id}`);
  },

  /**
   * Clear the cache (useful for logout or forced refresh)
   */
  clearCache: () => {
    todoCache.clear();
    activeRequests.clear();
  }
};
