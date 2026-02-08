/**
 * Todo type definitions aligned with backend Todo model
 */

/** Allowed priority levels for a Todo */
export type Priority = 'high' | 'medium' | 'low';

/** Recurrence patterns for recurring tasks */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | null;

/** Represents a single Todo item */
export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  priority: Priority;
  tags: string[];
  due_date?: string | null; // ISO 8601 timestamp
  recurrence?: RecurrencePattern;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/** Payload for creating a new Todo */
export interface TodoCreateRequest {
  title: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
  recurrence?: RecurrencePattern;
}

/** Payload for updating an existing Todo */
export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
  recurrence?: RecurrencePattern;
}

/** Payload for toggling completion status of a Todo */
export interface TodoToggleRequest {
  is_completed: boolean;
}

/** Response returned by backend for a single Todo */
export interface TodoResponse extends Todo {}

/** Filtering options for Todo list */
export interface TodoFilters {
  status?: 'all' | 'completed' | 'incomplete';
  priority?: Priority | 'all';
  tags?: string[];
  searchQuery?: string;
}

/** Sorting options for Todos */
export type SortOption = 'due_date' | 'priority' | 'title' | 'created_at';
