/**
 * Adapter to handle todos from backend that may not have new fields
 * This ensures backward compatibility
 */

import type { Todo, Priority } from '../types/todo';

/**
 * Normalize priority value - handle various formats from backend
 */
function normalizePriority(priority: any): Priority {
  if (!priority) return 'medium';

  const normalized = priority.toLowerCase().trim();

  if (['high', 'medium', 'low'].includes(normalized)) {
    return normalized as Priority;
  }

  // If priority is a number (1, 2, 3), map it
  if (normalized === '1' || normalized === 'high') return 'high';
  if (normalized === '2' || normalized === 'medium') return 'medium';
  if (normalized === '3' || normalized === 'low') return 'low';

  return 'medium';
}

/**
 * Add default values for new fields if they don't exist
 */
export function adaptTodoFromBackend(todo: any): Todo {
  return {
    id: todo.id,
    user_id: todo.user_id,
    title: todo.title || '',
    description: todo.description || null,
    is_completed: todo.is_completed || false,
    priority: normalizePriority(todo.priority),
    tags: todo.tags || [],
    due_date: todo.due_date || null,
    recurrence: todo.recurrence || null,
    created_at: todo.created_at || new Date().toISOString(),
    updated_at: todo.updated_at || new Date().toISOString(),
  };
}

/**
 * Adapt multiple todos from backend
 */
export function adaptTodosFromBackend(todos: any[]): Todo[] {
  return todos.map(adaptTodoFromBackend);
}

/**
 * Remove new fields if backend doesn't support them yet
 * Use this temporarily until backend is updated
 */
export function stripNewFields(todo: any): any {
  const { priority, tags, due_date, recurrence, ...oldFields } = todo;
  return oldFields;
}
