/**
 * Helper functions for filtering and sorting todos
 */

import type { Todo, TodoFilters, SortOption, Priority } from '../types/todo';

/**
 * Filter todos based on filter criteria
 */
export function filterTodos(todos: Todo[], filters: TodoFilters): Todo[] {
  return todos.filter((todo) => {
    // Filter by status
    if (filters.status === 'completed' && !todo.is_completed) return false;
    if (filters.status === 'incomplete' && todo.is_completed) return false;

    // Filter by priority
    if (filters.priority !== 'all' && todo.priority !== filters.priority) return false;

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        todo.tags && todo.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description?.toLowerCase().includes(query);
      const matchesTags = todo.tags?.some(tag => tag.toLowerCase().includes(query));

      if (!matchesTitle && !matchesDescription && !matchesTags) return false;
    }

    return true;
  });
}

/**
 * Sort todos based on sort option
 */
export function sortTodos(todos: Todo[], sortBy: SortOption): Todo[] {
  const sorted = [...todos];

  switch (sortBy) {
    case 'due_date':
      return sorted.sort((a, b) => {
        // Todos with no due date go to the end
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

    case 'priority':
      const priorityOrder: Record<Priority, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      return sorted.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    case 'title':
      return sorted.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });

    case 'created_at':
    default:
      return sorted.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }
}

/**
 * Get all unique tags from todos
 */
export function getAllTags(todos: Todo[]): string[] {
  const tagsSet = new Set<string>();
  todos.forEach(todo => {
    if (todo.tags) {
      todo.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet).sort();
}

/**
 * Get formatted due date string
 */
export function getFormattedDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Check if a todo is overdue
 */
export function isOverdue(todo: Todo): boolean {
  return !!todo.due_date && !todo.is_completed && new Date(todo.due_date) < new Date();
}

/**
 * Check if a todo is due soon (within 24 hours)
 */
export function isDueSoon(todo: Todo): boolean {
  if (!todo.due_date || todo.is_completed) return false;
  const dueTime = new Date(todo.due_date).getTime();
  const now = Date.now();
  const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 24;
}
