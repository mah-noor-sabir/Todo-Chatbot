/**
 * Todo list container component – Premium UI (Blue Theme)
 */
'use client';

import type { Todo } from '../../lib/types/todo';
import TodoItem from './TodoItem';
import EmptyState from '../layout/EmptyState';
import ErrorMessage from '../ui/ErrorMessage';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  onToggle: (id: number, is_completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  pendingOperations?: Set<number>;
  viewMode?: 'list' | 'grid';
}

export default function TodoList({
  todos,
  loading,
  error,
  onToggle,
  onEdit,
  onDelete,
  pendingOperations,
  viewMode = 'list',
}: TodoListProps) {
  if (loading) {
    return (
      <div className="todo-loading text-center py-12 text-blue-400">
        <p className="text-sm tracking-wide">Loading tasks…</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!todos.length) {
    return <EmptyState />;
  }

  return (
    <div
      className={`todo-list blue-theme ${
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
          : 'flex flex-col gap-5'
      }`}
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isPending={pendingOperations?.has(todo.id)}
        />
      ))}
    </div>
  );
}
