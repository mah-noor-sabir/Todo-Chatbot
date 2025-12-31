'use client';

interface TagsListProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  maxDisplay?: number;
}

export default function TagsList({ tags, onRemove, maxDisplay }: TagsListProps) {
  if (!tags || tags.length === 0) return null;

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-sm"
        >
          <span className="font-semibold">#</span>
          <span className="capitalize">{tag}</span>
          {onRemove && (
            <button
              onClick={() => onRemove(tag)}
              className="ml-1 text-purple-100 hover:text-white transition-colors"
              aria-label={`Remove ${tag} tag`}
              type="button"
            >
              ×
            </button>
          )}
        </span>
      ))}

      {remainingCount > 0 && (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700 text-gray-200 text-sm">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
