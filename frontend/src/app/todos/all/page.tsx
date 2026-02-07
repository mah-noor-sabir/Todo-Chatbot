'use client';

/**
 * All Tasks Page - Shows all tasks with search and create functionality
 */

import { useState, useMemo, useEffect } from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import Header from '../../../components/layout/Header';
import TodoList from '../../../components/todos/TodoList';
import AddTodoForm from '../../../components/todos/AddTodoForm';
import EditTodoForm from '../../../components/todos/EditTodoForm';
import DeleteConfirm from '../../../components/todos/DeleteConfirm';
import SearchBar from '../../../components/todos/SearchBar';
import { useTodos } from '../../../hooks/useTodos';
import { useAuthContext } from '../../../hooks/AuthContext';
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '../../../lib/types/todo';

export default function AllTasksPage() {
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

  // Get user from auth context to display their name
  const { user } = useAuthContext();
  const userName = user?.first_name || user?.email?.split('@')[0] || 'there';

  /* Sync with chatbot */
  useEffect(() => {
    const sync = () => fetchTodos();
    window.addEventListener('chatbotTodoUpdate', sync);
    return () => window.removeEventListener('chatbotTodoUpdate', sync);
  }, [fetchTodos]);

  /* Search */
  const filteredTodos = useMemo(() => {
    if (!searchQuery.trim()) return todos;
    const q = searchQuery.toLowerCase();
    return todos.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }, [todos, searchQuery]);

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

        <Header />

        <main className="max-w-[1300px] mx-auto px-8 py-10">

          {/* Header row */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                All Tasks<span className="text-blue-500">.</span>
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Hello{' '}
                <strong className="text-white font-semibold">
                  {userName}
                </strong>
                ,{' '}
                <span className="text-blue-400 font-medium">You have
                  {todos.length} {todos.length === 1 ? 'task' : 'tasks'} remaining
                </span>
                .
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
                className="
    inline-flex items-center justify-center
    px-8 py-4
    rounded-xl
    bg-blue-500 text-white font-bold
    text-lg
    shadow-lg
    hover:bg-blue-600
    active:scale-95
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
  "
              >
                + Create
              </button>


            </div>
          </div>

          {/* Stats row */}
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card large glass">
              <span>Productivity</span>
              <h2>{progress}%</h2>
              <div className="progress">
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="stat-card small glass">
              <span>Completed</span>
              <h3>{completed}</h3>
            </div>

            <div className="stat-card small glass">
              <span>Due Soon</span>
              <h3>0</h3>
            </div>
          </div>

          {/* Task list */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <TodoList
              todos={filteredTodos}
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
        </main>

        {/* Modals */}
        <AddTodoForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={(data: TodoCreateRequest) => createTodo(data)}
        />

        <EditTodoForm
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

      <style jsx global>{`
        .stats-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.4rem;
        }

        .stat-card.large h2 {
          font-size: 3rem;
        }

        .stat-card.small {
          padding: 1.1rem;
        }

        .glass {
          background: rgba(15, 30, 60, 0.55);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(90, 150, 255, 0.25);
          box-shadow: 0 0 30px rgba(90, 150, 255, 0.15);
          border-radius: 18px;
        }

        .progress {
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .progress div {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #7dd3fc);
        }
      `}</style>
    </AuthGuard>
  );
}