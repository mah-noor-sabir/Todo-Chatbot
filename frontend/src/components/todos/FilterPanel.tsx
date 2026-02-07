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

  /** ---------- Styling ---------- */
  const base =
    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200';

  const inactive =
    'bg-blue-600/20 text-white/70 hover:bg-blue-600/35 hover:text-white';

  const active =
    'bg-blue-500/50 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)]';

  return (
    <div className="flex flex-col gap-6">

      {/* STATUS */}
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Status
        </span>
        <div className="flex flex-wrap gap-3">
          {(['all', 'incomplete', 'completed'] as TodoFilters['status'][]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`${base} ${
                  filters.status === status ? active : inactive
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
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Priority
        </span>
        <div className="flex flex-wrap gap-3">
          {(['all', 'high', 'medium', 'low'] as (Priority | 'all')[]).map((p) => {
            const isActive = filters.priority === p;

            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePriorityChange(p)}
                className={`${base} ${
                  isActive ? active : inactive
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
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">
            Tags
          </span>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`${base} ${
                  tags.includes(tag) ? active : inactive
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
          className="self-start text-sm text-blue-300 hover:text-blue-200 transition"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
