'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DateTimePicker from './DateTimePicker';
import { validateTitle, validateDescription } from '../../lib/utils/validation';
import type { Todo, TodoUpdateRequest, Priority, RecurrencePattern } from '../../lib/types/todo';
import './EditTodoForm.css';

interface EditTodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSubmit: (id: number, data: TodoUpdateRequest) => Promise<void>;
}

export default function EditTodoForm({
  isOpen,
  onClose,
  todo,
  onSubmit,
}: EditTodoFormProps) {
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

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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
      priority, // Always include priority explicitly
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

  const handleCancel = () => {
    if (todo) {
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

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Edit Todo">
      <form className="edit-todo-form space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          placeholder="What needs to be done?"
          maxLength={200}
        />

        <div className="edit-textarea-group">
          <label htmlFor="edit-description" className="edit-label">
            Description (optional)
          </label>

          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`edit-textarea ${descriptionError ? 'error' : ''}`}
            rows={3}
            maxLength={1000}
            placeholder="Add more details..."
          />

          {descriptionError && (
            <p className="edit-error-text">{descriptionError}</p>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold italic text-gray-300 mb-2">
            Priority: <span style={{ color: '#d8b4fe', fontWeight: 'bold' }}>{priority.toUpperCase()}</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPriority(p);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: priority === p ? '3px solid #a855f7' : '2px solid #4b5563',
                  background: priority === p
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.15))'
                    : 'rgba(15, 23, 42, 0.85)',
                  color: priority === p ? '#e9d5ff' : '#9ca3af',
                  fontWeight: priority === p ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: priority === p ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
                  transform: priority === p ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (priority !== p) {
                    e.currentTarget.style.borderColor = '#6b7280';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (priority !== p) {
                    e.currentTarget.style.borderColor = '#4b5563';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                  }
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                  {p === 'high' && '🔴'}
                  {p === 'medium' && '🟡'}
                  {p === 'low' && '🟢'}
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="edit-tags" className="block text-sm font-semibold italic text-gray-300 mb-1">
            Tags (press Enter to add)
          </label>
          <input
            id="edit-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-3 py-2 rounded border border-gray-700 bg-[rgba(15,23,42,0.85)] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., work, personal, urgent"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Due Date */}
        <DateTimePicker value={dueDate} onChange={setDueDate} />

        {/* Recurrence */}
        <div>
          <label className="block text-sm font-semibold italic text-gray-300 mb-2">
            Recurring Task
          </label>
          <select
            value={recurrence || ''}
            onChange={(e) => setRecurrence((e.target.value as RecurrencePattern) || null)}
            className="w-full px-3 py-2 rounded border border-gray-700 bg-[rgba(15,23,42,0.85)] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="edit-actions">
          <Button
            type="button"
            variant="secondary"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="save-btn"
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
