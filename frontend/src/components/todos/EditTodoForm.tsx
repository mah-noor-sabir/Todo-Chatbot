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

export default function EditTodoForm({ isOpen, onClose, todo, onSubmit }: EditTodoFormProps) {
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

  // Initialize form when todo changes
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

  // Add new tag on Enter
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter(t => t !== tagToRemove));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo) return;

    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);
    setTitleError(titleValidation || '');
    setDescriptionError(descriptionValidation || '');
    if (titleValidation || descriptionValidation) return;

    const submitData: TodoUpdateRequest = {
      title,
      description: description || undefined,
      priority,
      tags: tags.length > 0 ? tags : undefined,
      due_date: dueDate,
      recurrence,
    };

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

  // Predefined suggestions
  const tagSuggestions = ['Personal', 'Business', 'Family', 'Event', 'Working'];

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
          {descriptionError && <p className="edit-error-text">{descriptionError}</p>}
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold italic text-gray-300 mb-2">
            Priority: <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>{priority.toUpperCase()}</span>
          </label>
          <div className="edit-priority-group">
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={(e) => { e.preventDefault(); setPriority(p); }}
                className={`edit-priority-btn ${p} ${priority === p ? 'active' : ''}`}
              >
                <span className="priority-icon">
                  {p === 'high' && '🔴'}
                  {p === 'medium' && '🟡'}
                  {p === 'low' && '🟢'}
                </span>
                <span className="priority-label">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags Input with Suggestions */}
        <div className="edit-tags-wrapper" style={{ position: 'relative' }}>
          <label htmlFor="edit-tags" className="block text-sm font-semibold italic text-gray-300 mb-1">
            Tags (Enter to add)
          </label>
          <input
            id="edit-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="edit-tag-input"
            placeholder="e.g., work, personal, urgent"
            autoComplete="off"
          />

          {/* Dropdown Suggestions */}
          {tagInput && (
            <div className="tags-suggestions">
              {tagSuggestions
                .filter(s => s.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(s.toLowerCase()))
                .map(suggestion => (
                  <div
                    key={suggestion}
                    className="tags-suggestion-item"
                    onClick={() => { setTags([...tags, suggestion.toLowerCase()]); setTagInput(''); }}
                  >
                    {suggestion}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Display Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="edit-tag">
                #{tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Due Date */}
        <DateTimePicker value={dueDate} onChange={setDueDate} />

        {/* Recurrence */}
        <div>
          <label className="block text-sm font-semibold italic text-gray-300 mb-2">Recurring Task</label>
          <select
            value={recurrence || ''}
            onChange={(e) => setRecurrence((e.target.value as RecurrencePattern) || null)}
            className="edit-select"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="edit-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
