'use client';

import { useState, useEffect } from 'react';
import type { Todo, Priority } from '../../lib/types/todo';
import TagsList from './TagsList';
import './ModalsShared.css';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  todo,
  onConfirm,
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
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

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date for display
  const formatDueDate = (dateString: string | null | undefined) => {
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

  // Get priority badge class
  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'modal-priority-high';
      case 'medium':
        return 'modal-priority-medium';
      case 'low':
        return 'modal-priority-low';
      default:
        return 'modal-priority-medium';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-container">
        <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-delete-title">Delete Todo</h2>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="modal-form">
            {/* Confirmation Message */}
            <p className="delete-confirm-message">
              Are you sure you want to delete this todo? This action cannot be undone.
            </p>

            {/* Todo Details */}
            {todo && (
              <div className="delete-todo-details">
                {/* Title */}
                <div className="delete-todo-field">
                  <div className="delete-field-label">Title</div>
                  <div className="delete-field-value delete-todo-title">
                    "{todo.title}"
                  </div>
                </div>

                {/* Description */}
                {todo.description && (
                  <div className="delete-todo-field">
                    <div className="delete-field-label">Description</div>
                    <div className="delete-field-value delete-todo-description">
                      {todo.description}
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div className="delete-todo-field">
                  <div className="delete-field-label">Priority</div>
                  <div className="delete-field-value">
                    <span className={`modal-priority-badge ${getPriorityBadgeClass(todo.priority)}`}>
                      {todo.priority === 'high' && '🔴'}
                      {todo.priority === 'medium' && '🟡'}
                      {todo.priority === 'low' && '🟢'}
                      <span className="capitalize">{todo.priority}</span>
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="delete-todo-field">
                    <div className="delete-field-label">Tags</div>
                    <div className="delete-field-value">
                      <TagsList tags={todo.tags} maxDisplay={10} />
                    </div>
                  </div>
                )}

                {/* Due Date */}
                <div className="delete-todo-field">
                  <div className="delete-field-label">Due Date</div>
                  <div className="delete-field-value">
                    {formatDueDate(todo.due_date)}
                  </div>
                </div>

                {/* Recurrence */}
                {todo.recurrence && (
                  <div className="delete-todo-field">
                    <div className="delete-field-label">Recurrence</div>
                    <div className="delete-field-value capitalize">
                      {todo.recurrence}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning Message */}
            <div className="delete-confirm-warning">
              <span>⚠</span>
              <span>This action cannot be undone!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
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
