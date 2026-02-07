/**
 * SearchBar component for filtering todos by keyword
 */
'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search todos...',
}: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Search Icon */}
      <svg
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '1.25rem',
          height: '1.25rem',
          color: '#3b82f6', // blue
          pointerEvents: 'none',
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Search Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem 3rem',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(59, 130, 246, 0.3)', // blue
          borderRadius: '12px',
          color: '#e5f0ff',
          fontSize: '1rem',
          transition: 'all 0.3s',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)';
          e.target.style.background = 'rgba(15, 23, 42, 0.95)';
          e.target.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.25)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          e.target.style.background = 'rgba(15, 23, 42, 0.85)';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: 'rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            transition: 'color 0.3s',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#bfdbfe';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(59, 130, 246, 0.4)';
          }}
        >
          <svg
            style={{ width: '1.25rem', height: '1.25rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
