'use client';

import type { Priority, TodoFilters } from '../../lib/types/todo';

interface FilterPanelProps {
  filters: TodoFilters;
  availableTags: string[];
  onFilterChange: (filters: TodoFilters) => void;
}

export default function FilterPanel({
  filters,
  availableTags,
  onFilterChange,
}: FilterPanelProps) {
  const tags = filters.tags || [];

  const handleStatusChange = (status: TodoFilters['status']) => {
    onFilterChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: Priority | 'all') => {
    onFilterChange({ ...filters, priority });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];

    onFilterChange({ ...filters, tags: newTags });
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    tags.length > 0;

  const clearFilters = () => {
    onFilterChange({
      status: 'all',
      priority: 'all',
      tags: [],
      searchQuery: filters.searchQuery,
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* STATUS */}
      <div className="space-y-2">
        <span className="filter-section-title">
          Status
        </span>
        <div className="filter-single-line">
          {(['all', 'incomplete', 'completed'] as TodoFilters['status'][]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`filter-btn ${
                  filters.status === status ? 'active' : ''
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'incomplete'
                  ? 'Active'
                  : 'Completed'}
              </button>
            )
          )}
        </div>
      </div>

      {/* PRIORITY */}
      <div className="space-y-2">
        <span className="filter-section-title">
          Priority
        </span>
        <div className="filter-single-line">
          {(['all', 'high', 'medium', 'low'] as (Priority | 'all')[]).map((p) => {
            const isActive = filters.priority === p;

            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePriorityChange(p)}
                className={`filter-btn ${
                  p !== 'all' ? p : ''
                } ${
                  isActive ? 'active' : ''
                }`}
              >
                {p === 'all'
                  ? 'All'
                  : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAGS */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <span className="filter-section-title">
            Tags
          </span>
          <div className="filter-single-line">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`filter-btn ${
                  tags.includes(tag) ? 'active' : ''
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CLEAR */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="clear-filter-btn self-start"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
