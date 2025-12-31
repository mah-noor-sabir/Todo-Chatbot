'use client';

import { useState, useEffect } from 'react';
import type { Todo, Priority, TodoUpdateRequest, RecurrencePattern } from '../../lib/types/todo';
import { validateTitle, validateDescription } from '../../lib/utils/validation';
import './ModalsShared.css';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSubmit: (id: number, data: TodoUpdateRequest) => Promise<void>;
}

export default function EditTodoModal({
  isOpen,
  onClose,
  todo,
  onSubmit,
}: EditTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(null);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form when todo is loaded
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setTags(todo.tags || []);
      setDueDate(todo.due_date || null);
      setRecurrence(todo.recurrence || null);
      setTitleError('');
      setDescriptionError('');
    }
  }, [todo]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle adding a new tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo) return;

    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    setTitleError(titleValidation || '');
    setDescriptionError(descriptionValidation || '');

    if (titleValidation || descriptionValidation) return;

    // Ensure priority is always sent explicitly
    const submitData: TodoUpdateRequest = {
      title,
      description: description || undefined,
      priority: priority, // Always include priority explicitly
      tags: tags.length > 0 ? tags : undefined,
      due_date: dueDate,
      recurrence,
    };

    console.log('Updating todo with priority:', priority, submitData); // Debug logging

    try {
      setLoading(true);
      await onSubmit(todo.id, submitData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (todo) {
      // Reset to original values
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setTags(todo.tags || []);
      setDueDate(todo.due_date || null);
      setRecurrence(todo.recurrence || null);
    }
    setTitleError('');
    setDescriptionError('');
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-container">
        <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">Edit Todo</h2>
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleCancel}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Title */}
            <div>
              <label htmlFor="title" className="modal-label required">
                Title
              </label>
              <input
                id="title"
                type="text"
                className={`modal-input ${titleError ? 'error' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                maxLength={200}
                required
              />
              {titleError && <div className="modal-error">{titleError}</div>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="modal-label">
                Description (optional)
              </label>
              <textarea
                id="description"
                className={`modal-textarea ${descriptionError ? 'error' : ''}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Add more details..."
              />
              {descriptionError && <div className="modal-error">{descriptionError}</div>}
            </div>

            {/* Priority Selector */}
            <div>
              <label className="modal-label">Priority</label>
              <div className="modal-priority-group">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`modal-priority-btn ${priority === p ? 'active' : ''}`}
                  >
                    <span className="icon">
                      {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="modal-label">
                Tags (press Enter to add)
              </label>
              <input
                id="tags"
                type="text"
                className="modal-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g., work, personal, urgent"
                maxLength={30}
              />
              {tags.length > 0 && (
                <div className="modal-tags-container">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="modal-tag"
                    >
                      #{tag}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="modal-label">
                Due Date (optional)
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                className="modal-input"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value || null)}
              />
            </div>

            {/* Recurrence */}
            <div>
              <label htmlFor="recurrence" className="modal-label">
                Recurring Task (optional)
              </label>
              <select
                id="recurrence"
                className="modal-select"
                value={recurrence || ''}
                onChange={(e) => setRecurrence((e.target.value as RecurrencePattern) || null)}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`modal-btn modal-btn-primary ${loading ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={loading || !title.trim()}
              >
                {loading ? <span className="modal-spinner"></span> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
