'use client';

/**
 * Reusable Button component
 * - Variants: primary | secondary | danger
 * - Loading state with spinner
 * - Fully customizable via className
 */

import React from 'react';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    px-6 py-3
    rounded-full
    font-semibold tracking-wide
    transition-all duration-200 ease-out
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-blue-400
    focus-visible:ring-offset-2 focus-visible:ring-offset-black
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600
      text-white
      shadow-[0_0_18px_rgba(59,130,246,0.6)]
      hover:shadow-[0_0_45px_rgba(59,130,246,1)]
      hover:scale-105
      active:scale-95
    `,
    secondary: `
      bg-gray-800 text-gray-200
      border border-white/10
      hover:bg-gray-700
    `,
    danger: `
      bg-red-600 text-white
      shadow-[0_0_15px_rgba(239,68,68,0.6)]
      hover:shadow-[0_0_30px_rgba(239,68,68,0.9)]
      hover:bg-red-500
    `,
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="
            w-5 h-5
            border-2 border-white/70
            border-t-transparent
            rounded-full
            animate-spin
          "
        />
      ) : (
        children
      )}
    </button>
  );
}
