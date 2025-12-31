/**
 * Error message display component – dark/glass theme
 */
'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-600 bg-red-900/40 px-4 py-3 backdrop-blur-md">
      {/* Icon */}
      <span className="text-red-500 font-bold">⚠</span>

      {/* Message text */}
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
