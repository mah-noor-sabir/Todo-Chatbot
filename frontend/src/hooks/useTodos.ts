/**
 * Todo data management hook - OPTIMIZED
 * Implements optimistic UI updates for instant feedback
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { todosApi } from '../lib/api/todos';
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '../lib/types/todo';
import { ApiClientError } from '../lib/api/client';
import { adaptTodosFromBackend, adaptTodoFromBackend } from '../lib/utils/todoAdapter';

// Generate temporary ID for optimistic todos
let tempIdCounter = -1;
const generateTempId = () => --tempIdCounter;

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  createTodo: (data: TodoCreateRequest) => Promise<void>;
  updateTodo: (id: number, data: TodoUpdateRequest) => Promise<void>;
  toggleCompletion: (id: number, is_completed: boolean) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  // Pending operations tracking
  pendingOperations: Set<number>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track pending operations by todo ID (negative for create, positive for update/delete)
  const [pendingOperations, setPendingOperations] = useState<Set<number>>(new Set());
  // Store original todo for rollback on failure
  const todoRef = useRef<Map<number, Todo>>(new Map());

  // Fetch all todos
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todosApi.getTodos();
      setTodos(adaptTodosFromBackend(data));
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError('Failed to load todos. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ========== OPTIMISTIC CREATE ==========
  const createTodo = async (data: TodoCreateRequest) => {
    const tempId = generateTempId();

    // Create optimistic todo
    const optimisticTodo: Todo = {
      id: tempId,
      user_id: 0, // Will be set by backend
      title: data.title,
      description: data.description || null,
      is_completed: false,
      priority: data.priority || 'medium',
      tags: data.tags || [],
      due_date: data.due_date || null,
      recurrence: data.recurrence || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Mark as pending
      setPendingOperations((prev) => new Set([...prev, tempId]));

      // Optimistically add to list (newest first)
      setTodos((prev) => [optimisticTodo, ...prev]);

      // Make API call
      const newTodo = await todosApi.createTodo(data);

      // Replace optimistic todo with real one from server
      const adaptedTodo = adaptTodoFromBackend(newTodo);
      setTodos((prev) =>
        prev.map((t) => (t.id === tempId ? adaptedTodo : t))
      );

      // Clear pending
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    } catch (err) {
      // Rollback: remove optimistic todo
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

      if (err instanceof ApiClientError) setError(err.message);
      else setError('Failed to create todo. Please try again.');
      throw err;
    }
  };

  // ========== OPTIMISTIC UPDATE ==========
  const updateTodo = async (id: number, data: TodoUpdateRequest) => {
    // Store original for rollback
    const originalTodo = todos.find((t) => t.id === id);
    if (originalTodo) {
      todoRef.current.set(id, { ...originalTodo });
    }

    try {
      // Mark as pending
      setPendingOperations((prev) => new Set([...prev, id]));

      // Optimistically update
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, ...data, updated_at: new Date().toISOString() }
            : todo
        )
      );

      // Make API call
      const updatedTodo = await todosApi.updateTodo(id, data);

      // Update with server response
      const adaptedTodo = adaptTodoFromBackend(updatedTodo);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? adaptedTodo : todo))
      );

      // Clear pending
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      // Clean up ref
      todoRef.current.delete(id);
    } catch (err) {
      // Rollback: restore original
      const original = todoRef.current.get(id);
      if (original) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? original : todo))
        );
        todoRef.current.delete(id);
      }
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      if (err instanceof ApiClientError) {
        if (err.statusCode === 404) {
          // Todo was deleted on server, remove from list
          setTodos((prev) => prev.filter((todo) => todo.id !== id));
          setError('This todo has been deleted.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update todo. Please try again.');
      }
      throw err;
    }
  };

  // ========== OPTIMISTIC TOGGLE ==========
  const toggleCompletion = async (id: number, is_completed: boolean) => {
    // Store original for rollback
    const originalTodo = todos.find((t) => t.id === id);
    if (originalTodo) {
      todoRef.current.set(id, { ...originalTodo });
    }

    try {
      // Mark as pending
      setPendingOperations((prev) => new Set([...prev, id]));

      // Optimistically update
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, is_completed } : todo
        )
      );

      // Make API call
      const updatedTodo = await todosApi.toggleCompletion(id, is_completed);
      const adaptedTodo = adaptTodoFromBackend(updatedTodo);

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? adaptedTodo : todo))
      );

      // Clear pending
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      todoRef.current.delete(id);
    } catch (err) {
      // Rollback
      const original = todoRef.current.get(id);
      if (original) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? original : todo))
        );
        todoRef.current.delete(id);
      }
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      if (err instanceof ApiClientError) setError(err.message);
      else setError('Failed to update todo.');
      throw err;
    }
  };

  // ========== OPTIMISTIC DELETE ==========
  const deleteTodo = async (id: number) => {
    // Store original for potential rollback
    const todoToDelete = todos.find((t) => t.id === id);
    if (todoToDelete) {
      todoRef.current.set(id, { ...todoToDelete });
    }

    try {
      // Mark as pending
      setPendingOperations((prev) => new Set([...prev, id]));

      // Optimistically remove from list
      setTodos((prev) => prev.filter((todo) => todo.id !== id));

      // Make API call
      await todosApi.deleteTodo(id);

      // Clear pending
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      // Clean up ref
      todoRef.current.delete(id);
    } catch (err) {
      // Rollback: restore deleted todo
      if (todoToDelete) {
        setTodos((prev) => [todoToDelete, ...prev]);
        todoRef.current.delete(id);
      }
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      if (err instanceof ApiClientError) {
        if (err.statusCode === 404) {
          // Already gone on server, success
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to delete todo. Please try again.');
      }
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleCompletion,
    deleteTodo,
    pendingOperations,
  };
}
