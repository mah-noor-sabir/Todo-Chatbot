'use client';

import type { Priority, TodoFilters } from '../../lib/types/todo';

interface FilterPanelProps {
  filters: TodoFilters;
  availableTags: string[];
  onFilterChange: (filters: TodoFilters) => void;
}

export default function FilterPanel({ filters, availableTags, onFilterChange }: FilterPanelProps) {
  // Ensure filters.tags is always an array
  const tags = filters.tags || [];

  const handleStatusChange = (status: TodoFilters['status']) => {
    onFilterChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: Priority | 'all') => {
    onFilterChange({ ...filters, priority });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
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

  const buttonBaseClasses = 'px-3 py-1 rounded-md text-sm font-medium transition-all';
  const activeClass = 'ring-2 ring-purple-500 bg-purple-700 text-white';
  const inactiveClass = 'bg-[rgba(15,23,42,0.85)] text-gray-300 hover:bg-[rgba(15,23,42,0.95)]';

  return (
    <div className="flex flex-col gap-4">
      {/* Status Filters */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold italic text-gray-300">Status</span>
        <div className="flex gap-2">
          {(['all', 'incomplete', 'completed'] as TodoFilters['status'][]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`${buttonBaseClasses} ${
                filters.status === status ? activeClass : inactiveClass
              }`}
              type="button"
            >
              {status === 'all' ? 'All' : status === 'incomplete' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold italic text-gray-300">Priority</span>
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as (Priority | 'all')[]).map((p) => {
            const colorClass =
              p === 'high'
                ? 'bg-red-600 text-white'
                : p === 'medium'
                ? 'bg-yellow-500 text-white'
                : p === 'low'
                ? 'bg-green-600 text-white'
                : '';
            return (
              <button
                key={p}
                onClick={() => handlePriorityChange(p)}
                className={`${buttonBaseClasses} ${
                  filters.priority === p ? `${activeClass} ${colorClass}` : inactiveClass
                }`}
                type="button"
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold italic text-gray-300">Tags</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`${buttonBaseClasses} ${
                  tags.includes(tag) ? `${activeClass} bg-purple-600` : inactiveClass
                }`}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          type="button"
          className="mt-2 px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-all"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
