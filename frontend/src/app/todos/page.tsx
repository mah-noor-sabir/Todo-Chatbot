'use client';

/**
 * Taskify – Dashboard Page
 * Pixel-matched to reference dashboard image
 */

import { useState, useMemo, useEffect } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import TodoList from '../../components/todos/TodoList';
import AddTodoForm from '../../components/todos/AddTodoForm';
import EditTodoModal from '../../components/todos/EditTodoModal';
import DeleteConfirm from '../../components/todos/DeleteConfirm';
import SearchBar from '../../components/todos/SearchBar';
import { useTodos } from '../../hooks/useTodos';
import { useAuthContext } from '../../hooks/AuthContext';
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '../../lib/types/todo';

export default function TodosPage() {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    toggleCompletion,
    deleteTodo,
    pendingOperations,
    fetchTodos,
  } = useTodos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Tasks'); // New filter state

  // Get user from auth context to display their name
  const { user } = useAuthContext();
  const userName = user?.first_name || user?.email?.split('@')[0] || 'there';

  /* Sync with chatbot */
  useEffect(() => {
    const sync = () => fetchTodos();
    window.addEventListener('chatbotTodoUpdate', sync);
    return () => window.removeEventListener('chatbotTodoUpdate', sync);
  }, [fetchTodos]);

  /* Search and Filter */
  const filteredTodos = useMemo(() => {
    let result = todos;

    // Apply search filter first
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    // Apply active filter
    switch (activeFilter) {
      case 'All Tasks':
        break; // Show all todos
      case 'Pending':
        result = result.filter(t => !t.is_completed);
        break;
      case 'Done':
        result = result.filter(t => t.is_completed);
        break;
      case 'High Priority':
        result = result.filter(t => t.priority?.toLowerCase() === 'high');
        break;
      default:
        break;
    }

    return result;
  }, [todos, searchQuery, activeFilter]);

  // Limit the displayed todos to first 3 for the dashboard view
  const limitedTodos = useMemo(() => {
    if (activeFilter !== 'All Tasks') {
      // Don't limit when a specific filter is active
      return filteredTodos;
    }
    return filteredTodos.slice(0, 3);
  }, [filteredTodos, activeFilter]);

  const completed = todos.filter(t => t.is_completed).length;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-[#0B0F1A] text-[#E5E7EB] overflow-hidden">

        {/* Grainy neon background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-40 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-20 right-40 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
        </div>

        {!(showAddForm || showEditForm || showDeleteConfirm) && <Header />}

        <main className="max-w-[1300px] mx-auto px-8 py-10">

          {/* ───────────────── Header row ───────────────── */}
         <div className="flex items-center justify-between mb-10">
  <div>
    <h1 className="text-4xl font-extrabold tracking-tight">
      Dashboard<span className="text-blue-500">.</span>
    </h1>

    <p className="text-sm text-gray-400 mt-1">
      Hello,{' '}
      <strong className="text-white font-semibold">
        {userName}
      </strong>
      . You have{' '}
      <span className="text-blue-400 font-medium">
        {todos.length}
      </span>{' '}
      tasks remaining.
    </p>
  </div>

  <div className="flex items-center gap-3">
    <div className="w-[260px]">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search…"
      />
    </div>

    <button
      onClick={() => setShowAddForm(true)}
      className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
    >
      + Create
    </button>
  </div>
</div>


          {/* ───────────────── Stats row ───────────────── */}
          <div className="grid grid-cols-12 gap-6 mb-8">

            {/* Productivity */}
            <div className="col-span-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className="text-xs uppercase text-gray-400 mb-2">
                Productivity
              </div>
              <div className="text-5xl font-bold">{progress}%</div>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div className="col-span-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className="text-xs uppercase text-green-400 mb-2">
                Completed Today
              </div>
              <div className="text-4xl font-bold">{completed}</div>
            </div>

            {/* Due Soon */}
            <div className="col-span-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className="text-xs uppercase text-yellow-400 mb-2">
                Due Soon
              </div>
              <div className="text-4xl font-bold">0</div>
            </div>
          </div>

          {/* ───────────────── Main content ───────────────── */}
          <div className="grid grid-cols-12 gap-8">

            {/* Sidebar */}
            <aside className="col-span-3 space-y-6">
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                <div className="text-xs text-gray-400 mb-3">Filters</div>
                <ul className="space-y-2 text-sm">
                  <li
                    className={`cursor-pointer ${activeFilter === 'All Tasks' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveFilter('All Tasks')}
                  >
                    All Tasks
                  </li>
                  <li
                    className={`cursor-pointer ${activeFilter === 'Pending' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveFilter('Pending')}
                  >
                    Pending
                  </li>
                  <li
                    className={`cursor-pointer ${activeFilter === 'Done' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveFilter('Done')}
                  >
                    Done
                  </li>
                  <li
                    className={`cursor-pointer ${activeFilter === 'High Priority' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    onClick={() => setActiveFilter('High Priority')}
                  >
                    High Priority
                  </li>
                </ul>
              </div>
            </aside>

            {/* Task list */}
            <section className="col-span-9">
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Tasks</h2>
                  <a
                    href="/todos/all"
                    className="px-4 py-2 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Show More
                  </a>
                </div>
                <TodoList
                  todos={limitedTodos}
                  loading={loading}
                  error={error}
                  onToggle={toggleCompletion}
                  onEdit={(todo) => {
                    setSelectedTodo(todo);
                    setShowEditForm(true);
                  }}
                  onDelete={(todo) => {
                    setSelectedTodo(todo);
                    setShowDeleteConfirm(true);
                  }}
                  pendingOperations={pendingOperations}
                />
              </div>
            </section>
          </div>
        </main>

        {/* Modals */}
        <AddTodoForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={(data: TodoCreateRequest) => createTodo(data)}
        />

        <EditTodoModal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          todo={selectedTodo}
          onSubmit={(id, data: TodoUpdateRequest) => updateTodo(id, data)}
        />

        <DeleteConfirm
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          todo={selectedTodo}
          onConfirm={(id) => deleteTodo(id)}
        />
      </div>
    </AuthGuard>
  );
}
