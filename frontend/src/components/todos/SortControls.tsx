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
    <div className="sort-controls">
      <span className="sort-label">
        Sort by
      </span>

      <div className="sort-select-wrapper">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="sort-select"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0b1020] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <span className="sort-select-arrow">
          ▾
        </span>
      </div>
    </div>
  );
}
