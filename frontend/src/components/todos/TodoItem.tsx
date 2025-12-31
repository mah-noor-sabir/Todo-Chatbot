/**
 * Individual todo item component – Premium UI
 */
'use client';

import type { Todo } from '../../lib/types/todo';
import PriorityBadge from './PriorityBadge';
import TagsList from './TagsList';
import './TodoComponents.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, is_completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isPending?: boolean;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete, isPending }: TodoItemProps) {
  const isOverdue = todo.due_date && !todo.is_completed && new Date(todo.due_date) < new Date();
  const isDueSoon = todo.due_date && !todo.is_completed &&
    new Date(todo.due_date).getTime() - Date.now() < 24 * 60 * 60 * 1000 &&
    new Date(todo.due_date) > new Date();

  return (
    <div className={`todo-item glass-effect ${todo.is_completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isPending ? 'pending' : ''}`}>
      <div className="todo-item-header">
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          className="todo-checkbox"
        />
        <div className="todo-item-content">
          <div className="todo-item-title-row">
            <h3 className="todo-item-title">{todo.title}</h3>
            <PriorityBadge priority={todo.priority} />
          </div>
          {todo.description && (
            <p className="todo-item-description">{todo.description}</p>
          )}
          <div className="todo-item-metadata">
            {todo.tags && todo.tags.length > 0 && (
              <TagsList tags={todo.tags} maxDisplay={3} />
            )}
            {todo.due_date && (
              <div className={`todo-due-date ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`}>
                <svg className="due-date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {new Date(todo.due_date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {todo.recurrence && (
              <div className="todo-recurrence">
                <svg className="recurrence-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{todo.recurrence}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="todo-item-actions">
        <button
          onClick={() => onEdit(todo)}
          className="todo-action-btn todo-edit-btn"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(todo)}
          className="todo-action-btn todo-delete-btn"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
