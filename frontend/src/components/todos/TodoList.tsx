/**
 * Todo list container component – Premium UI
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
}

export default function TodoList({
  todos,
  loading,
  error,
  onToggle,
  onEdit,
  onDelete,
  pendingOperations,
}: TodoListProps) {
  if (loading) {
    return (
      <div className="todo-loading text-center py-12 text-gray-400">
        <p>Loading todos...</p>
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
    <div className="todo-list flex flex-col gap-4">
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
