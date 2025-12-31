/**
 * Empty state component for when user has no todos
 */

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-75">
      <div className="card p-8 text-center max-w-sm mx-auto">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-xl font-bold italic text-white mb-2">No todos yet</h2>
        <p className="text-gray-400">Create your first one to get started!</p>
      </div>
    </div>
  );
}
