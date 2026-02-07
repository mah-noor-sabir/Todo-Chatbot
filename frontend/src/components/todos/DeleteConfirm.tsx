'use client';

import { useState, useEffect } from 'react';
import type { Todo, Priority } from '../../lib/types/todo';
import TagsList from './TagsList';
import './DeleteConfirm.css';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirm({ isOpen, onClose, todo, onConfirm }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!todo) return;
    try {
      setLoading(true);
      await onConfirm(todo.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'modal-priority-high';
      case 'medium': return 'delete-priority-medium';
      case 'low': return 'delete-priority-low';
      default: return 'delete-priority-medium';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-container">
        <div className="modal-box delete-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-delete-title">Delete Task</h2>
          </div>

          {/* Confirmation Message */}
          <p className="delete-confirm-message">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          {/* Todo Details */}
          {todo && (
            <div className="delete-todo-details">
              <div className="delete-todo-field">
                <span className="delete-field-label">Title:</span>{' '}
                <span className="delete-field-value delete-todo-title">"{todo.title}"</span>
              </div>

              {todo.description && (
                <div className="delete-todo-field">
                  <span className="delete-field-label">Description:</span>{' '}
                  <span className="delete-field-value delete-todo-description">{todo.description}</span>
                </div>
              )}

              <div className="delete-todo-field">
                <span className="delete-field-label">Priority:</span>{' '}
                <span className={`delete-field-value modal-priority-badge ${getPriorityClass(todo.priority)}`}>
                  {todo.priority === 'high' && '🔴 '}
                  {todo.priority === 'medium' && '🟡 '}
                  {todo.priority === 'low' && '🟢 '}
                  <span className="capitalize">{todo.priority}</span>
                </span>
              </div>

              {todo.tags?.length > 0 && (
                <div className="delete-todo-field">
                  <span className="delete-field-label">Tags:</span>{' '}
                  <div className="delete-field-value">
                    <TagsList tags={todo.tags} maxDisplay={10} />
                  </div>
                </div>
              )}

              <div className="delete-todo-field">
                <span className="delete-field-label">Due Date:</span>{' '}
                <span className="delete-field-value">{formatDueDate(todo.due_date)}</span>
              </div>

              {todo.recurrence && (
                <div className="delete-todo-field">
                  <span className="delete-field-label">Recurrence:</span>{' '}
                  <span className="delete-field-value capitalize">{todo.recurrence}</span>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="delete-confirm-warning">
            <span>This action cannot be undone</span>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className={`modal-btn modal-btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? <span className="modal-spinner"></span> : 'Delete Todo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
