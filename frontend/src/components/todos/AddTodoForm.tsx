'use client';

import React, { useState, useEffect } from 'react';
import type { TodoCreateRequest, Priority, RecurrencePattern } from '../../lib/types/todo';
import { validateTitle, validateDescription } from '../../lib/utils/validation';
import './ModalsShared.css';

interface AddTodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TodoCreateRequest) => Promise<void>;
}

export default function AddTodoForm({ isOpen, onClose, onSubmit }: AddTodoFormProps) {
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

  const SUGGESTED_TAGS = ['Personal', 'Business', 'Family', 'Event', 'Working'];

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTags([]);
    setTagInput('');
    setDueDate(null);
    setRecurrence(null);
    setTitleError('');
    setDescriptionError('');
  };

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

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    setTitleError(titleValidation || '');
    setDescriptionError(descriptionValidation || '');
    if (titleValidation || descriptionValidation) return;

    const submitData: TodoCreateRequest = {
      title,
      description: description || undefined,
      priority,
      tags: tags.length ? tags : undefined,
      due_date: dueDate,
      recurrence,
    };

    try {
      setLoading(true);
      await onSubmit(submitData);
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div
          className="modal-box"
          style={{
            maxWidth: '460px',
            padding: '1.5rem',
            background: '#0B1220',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <h2
            className="modal-title"
            style={{
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '1rem',
            }}
          >
            ADD TASK
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form" style={{ gap: '0.6rem', maxHeight: 'none' }}>
            <input
              type="text"
              className={`modal-input ${titleError ? 'error' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />

            <textarea
              className={`modal-textarea ${descriptionError ? 'error' : ''}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Details (optional)"
            />

            {/* Meta Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {/* Calendar */}
              <input
                type="date"
                className="modal-input"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value || null)}
              />

              {/* Priority */}
              <div className="modal-priority-group compact" style={{ display: 'flex', flexDirection: 'row', gap: '0.3rem' }}>
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`modal-priority-btn ${p} ${priority === p ? 'active' : ''}`}
                    style={{ flex: 1, fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                  >
                    {p.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags input with suggestions */}
            <div className="modal-tags-wrapper" style={{ position: 'relative' }}>
              <input
                type="text"
                className="modal-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Tags (Enter)"
                autoComplete="off"
              />

              {/* Dropdown Suggestions */}
              {tagInput && (
                <div
                  className="tags-suggestions"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: 'rgba(3, 8, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    zIndex: 10,
                    maxHeight: '120px',
                    overflowY: 'auto',
                  }}
                >
                  {SUGGESTED_TAGS.filter(
                    tag =>
                      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                      !tags.includes(tag.toLowerCase())
                  ).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="tags-suggestion-item"
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        color: '#fff',
                      }}
                      onClick={() => {
                        setTags([...tags, suggestion.toLowerCase()]);
                        setTagInput('');
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="modal-tags-container">
                {tags.map(tag => (
                  <span key={tag} className="modal-tag">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Recurrence */}
            <select
              className="modal-select"
              value={recurrence || ''}
              onChange={(e) => setRecurrence((e.target.value as RecurrencePattern) || null)}
            >
              <option value="">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {/* Actions */}
            <div className="modal-actions" style={{ marginTop: '0.8rem' }}>
              <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
