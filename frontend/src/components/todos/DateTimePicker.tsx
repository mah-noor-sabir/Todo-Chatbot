'use client';

interface DateTimePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
}

export default function DateTimePicker({ value, onChange, label = 'Due Date' }: DateTimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value || null);
  };

  // Format value for datetime-local input
  const formattedValue = value ? new Date(value).toISOString().slice(0, 16) : '';

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <label
        htmlFor="due-date-input"
        className="flex items-center gap-2 text-sm font-semibold italic text-blue-200"
      >
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {label}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          id="due-date-input"
          type="datetime-local"
          value={formattedValue}
          onChange={handleChange}
          className="w-full pl-10 py-2 rounded-lg bg-blue-900/90 border border-blue-500/30 text-blue-50 text-sm outline-none transition-all focus:border-blue-400 focus:bg-blue-900/95"
        />
      </div>

      {/* Display formatted value */}
      {value && (
        <p className="flex items-center gap-2 text-sm italic text-blue-400 mt-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Due: {new Date(value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}
