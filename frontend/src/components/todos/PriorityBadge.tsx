'use client';

import type { Priority } from '../../lib/types/todo';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  // Normalize priority - handle any format from backend
  const normalizedPriority = (() => {
    if (!priority) return 'medium' as Priority;
    const p = String(priority).toLowerCase().trim();

    if (p === 'high' || p === '1') return 'high' as Priority;
    if (p === 'low' || p === '3') return 'low' as Priority;
    return 'medium' as Priority;
  })();

  // Map priority to icon and color with better contrast
  const badgeMap: Record<Priority, { icon: string; bgClass: string; textClass: string }> = {
    high: {
      icon: '🔴',
      bgClass: 'bg-gradient-to-r from-red-600 to-red-500',
      textClass: 'text-white',
    },
    medium: {
      icon: '🟡',
      bgClass: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      textClass: 'text-gray-900',
    },
    low: {
      icon: '🟢',
      bgClass: 'bg-gradient-to-r from-green-600 to-green-500',
      textClass: 'text-white',
    },
  };

  const { icon, bgClass, textClass } = badgeMap[normalizedPriority];

  // Size mapping
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${bgClass} ${textClass} ${sizeClasses[size]} shadow-md`}
    >
      <span>{icon}</span>
      <span className="capitalize">{normalizedPriority}</span>
    </span>
  );
}
