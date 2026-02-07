/**
 * Empty state component for when user has no todos
 */

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-xl font-semibold text-gray-300">
        No tasks found
      </h2>
    </div>
  );
}
