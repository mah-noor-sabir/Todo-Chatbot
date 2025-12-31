'use client';

import type { SortOption } from '../../lib/types/todo';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export default function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Alphabetical' },
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-300 italic">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-3 py-1 rounded border border-gray-700 bg-[rgba(15,23,42,0.85)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
