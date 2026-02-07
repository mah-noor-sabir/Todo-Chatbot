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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-blue-200">
        Sort by
      </span>

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="
            appearance-none
            bg-blue-600/30
            backdrop-blur-xl
            text-white
            text-sm
            px-5 py-2.5 pr-10
            rounded-full
            shadow-[0_0_18px_rgba(59,130,246,0.25)]
            hover:bg-blue-600/40
            focus:bg-blue-600/40
            focus:outline-none
            transition-all duration-200
          "
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0b1d3a] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* iOS-style arrow */}
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
          ▾
        </span>
      </div>
    </div>
  );
}
