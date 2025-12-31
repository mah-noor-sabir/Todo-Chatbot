'use client';

/**
 * Reusable Input component
 * - Dark / glassmorphism theme
 * - Built-in label & error handling
 * - Accessible & keyboard friendly
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-white/80"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={inputId}
        className={`
          w-full
          px-4 py-3
          rounded-xl
          bg-black/40 backdrop-blur-md
          text-white placeholder-white/40
          border
          transition-all duration-200
          focus:outline-none
          ${
            error
              ? `
                border-red-500
                focus:border-red-400
                focus:ring-1 focus:ring-red-400
              `
              : `
                border-white/10
                focus:border-purple-400
                focus:ring-1 focus:ring-purple-400
              `
          }
          ${className}
        `}
        {...props}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <span className="text-base leading-none">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
