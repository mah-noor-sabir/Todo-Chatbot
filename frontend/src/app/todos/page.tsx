'use client';

import { useState,useEffect, useMemo } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import TodoList from '../../components/todos/TodoList';
import AddTodoForm from '../../components/todos/AddTodoForm';
import EditTodoForm from '../../components/todos/EditTodoForm';
import DeleteConfirm from '../../components/todos/DeleteConfirm';
import SearchBar from '../../components/todos/SearchBar';
import FilterPanel from '../../components/todos/FilterPanel';
import SortControls from '../../components/todos/SortControls';
import Button from '../../components/ui/Button';
import { useTodos } from '../../hooks/useTodos';
import { filterTodos, sortTodos, getAllTags } from '../../lib/utils/todoHelpers';
import { useAuthContext } from '../../hooks/AuthContext';
import type { Todo, TodoFilters, SortOption } from '../../lib/types/todo';

export default function TodosPage() {
  const { todos, loading, error, createTodo, updateTodo, toggleCompletion, deleteTodo, fetchTodos } =
    useTodos();

  const { user } = useAuthContext();
  const userName = user?.first_name || user?.email?.split('@')[0] || 'there';

  /* Sync with chatbot */
  useEffect(() => {
    const sync = () => fetchTodos();
    window.addEventListener('chatbotTodoUpdate', sync);
    return () => window.removeEventListener('chatbotTodoUpdate', sync);
  }, [fetchTodos]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [filters, setFilters] = useState<TodoFilters>({
    status: 'all',
    priority: 'all',
    tags: [],
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const availableTags = useMemo(() => getAllTags(todos), [todos]);

  const filteredTodos = useMemo(() => {
    const filtered = filterTodos(todos, filters);
    return sortTodos(filtered, sortBy);
  }, [todos, filters, sortBy]);

  const completedCount = todos.filter((t) => t.is_completed).length;
  const pendingCount = todos.filter((t) => !t.is_completed).length;

  const productivity =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <AuthGuard>
      <div className="page">
        <Header />

        <main className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header glass">
            <div className="space-y-1">
              <h1 className="gradient-title">Dashboard</h1>

              <p className="text-sm text-white/60">
                Hello{' '}
                <strong className="font-semibold text-white">
                  {userName}
                </strong>
                , you have{' '}
                <span className="font-medium text-blue-400">
                  {pendingCount}
                </span>{' '}
                {pendingCount === 1 ? 'task' : 'tasks'} remaining.
              </p>
            </div>


            <div className="header-actions">
              <SearchBar
                value={filters.searchQuery || ''}
                onChange={(value) => setFilters({ ...filters, searchQuery: value })}
              />
              <Button onClick={() => setShowAddForm(true)}>＋ Create</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card large glass">
              <span>Productivity</span>
              <h2>{productivity}%</h2>
              <div className="progress">
                <div style={{ width: `${productivity}%` }} />
              </div>
            </div>

            <div className="stat-card small glass">
              <span>Completed</span>
              <h3>{completedCount}</h3>
            </div>

            <div className="stat-card small glass">
              <span>Pending Tasks</span>
              <h3>{pendingCount}</h3>
            </div>
          </div>

          {/* Layout */}
          <div className="dashboard-layout">
            <aside className="sidebar glass">
              <div className="sidebar-section">
                <h3 className="section-title">View</h3>
                <div className="view-controls">
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </button>
                </div>
              </div>

              <div className="sidebar-section">
                <h3 className="section-title">Sort</h3>
                <SortControls sortBy={sortBy} onSortChange={setSortBy} />
              </div>

              <div className="sidebar-section">
                <h3 className="section-title">Filters</h3>
                <FilterPanel
                  filters={filters}
                  availableTags={availableTags}
                  onFilterChange={setFilters}
                />
              </div>
            </aside>

            <div className="main-content">
              <div className="tasks-header">
                <h2 className="tasks-title">Tasks</h2>
                {todos.length >= 4 && (
                  <a href="/todos/all" className="show-more-btn">
                    Show All ({todos.length})
                  </a>
                )}
              </div>
              <TodoList
                todos={filteredTodos.slice(0, 3)} // Show only first 3 tasks
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
                viewMode={viewMode}
              />
              {todos.length >= 4 && filteredTodos.length > 3 && (
                <div className="show-more-footer">
                  <a href="/todos/all" className="show-more-link">
                    Show {filteredTodos.length - 3} more tasks...
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>

        <button className="ai-fab">✨</button>

        <AddTodoForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={createTodo}
        />
        <EditTodoForm
          isOpen={showEditForm}
          todo={selectedTodo}
          onClose={() => setShowEditForm(false)}
          onSubmit={(id, data) => updateTodo(id, data)}
        />
        <DeleteConfirm
          isOpen={showDeleteConfirm}
          todo={selectedTodo}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={(id) => deleteTodo(id)}
        />

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: radial-gradient(circle at top, #0b1f3a, #050814 70%);
            color: #e6f2ff;
          }

          .dashboard-container {
            max-width: 1400px;
            margin: auto;
            padding: 2.5rem 1.5rem;
          }

          .glass {
            background: rgba(15, 30, 60, 0.55);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(90, 150, 255, 0.25);
            box-shadow: 0 0 30px rgba(90, 150, 255, 0.15);
            border-radius: 18px;
          }

          .dashboard-header {
            padding: 1.8rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .gradient-title {
            font-size: 2.6rem;
            font-weight: 800;
            background: linear-gradient(
              90deg,
              #3b82f6,
              #60a5fa,
              #7dd3fc,
              #93c5fd
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .header-actions {
            display: flex;
            gap: 1rem;
          }

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

          .dashboard-layout {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 1.5rem;
          }

          .sidebar {
            padding: 1.5rem;
            height: fit-content;
          }

          .sidebar-section {
            margin-bottom: 1.5rem;
          }

          .sidebar-section h3 {
            font-size: 0.95rem;
            color: #93c5fd;
            margin-bottom: 0.75rem;
          }

          .view-controls {
            display: flex;
            gap: 0.5rem;
          }

          .view-btn {
            flex: 1;
            padding: 0.5rem;
            border-radius: 8px;
            background: rgba(20, 40, 80, 0.7);
            border: 1px solid rgba(90, 150, 255, 0.35);
            color: #cfe6ff;
          }

          .section-title {
            font-size: 0.95rem;
            color: #93c5fd;
            margin-bottom: 0.75rem;
            font-weight: 500;
          }

          .view-controls {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .view-btn {
            flex: 1;
            padding: 0.75rem;
            border-radius: 12px;
            background: rgba(20, 40, 80, 0.7);
            border: 1px solid rgba(90, 150, 255, 0.35);
            color: #cfe6ff;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .view-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(90, 150, 255, 0.5);
          }

          .view-btn.active {
            background: rgba(59, 130, 246, 0.35);
            border-color: rgba(90, 150, 255, 0.6);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.35);
          }

          /* Style for SortControls component */
          .sort-controls {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .sort-controls select {
            width: 100%;
            padding: 0.75rem;
            border-radius: 12px;
            background: rgba(20, 40, 80, 0.7);
            border: 1px solid rgba(90, 150, 255, 0.35);
            color: #cfe6ff;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .sort-controls select:hover {
            border-color: rgba(90, 150, 255, 0.5);
          }

          .sort-controls select:focus {
            outline: none;
            border-color: rgba(90, 150, 255, 0.6);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }

          /* Style for FilterPanel component - Airy rounded buttons */
          .filter-panel {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Status filter buttons */
          .filter-panel button {
            border-radius: 50px !important;
            padding: 0.625rem 1.25rem !important;
            background: transparent !important;
            border: 1px solid rgba(90, 150, 255, 0.3) !important;
            color: rgba(255, 255, 255, 0.7) !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            text-transform: capitalize;
          }

          .filter-panel button:hover {
            color: white !important;
            border-color: rgba(90, 150, 255, 0.5) !important;
          }

          .filter-panel button.text-blue-400 {
            color: #60a5fa !important;
            border-color: rgba(96, 165, 250, 0.5) !important;
            border-bottom: 2px solid #60a5fa !important;
          }

          /* Priority buttons with specific colors */
          .filter-panel button.text-red-400 {
            color: #f87171 !important;
            border-color: rgba(248, 113, 113, 0.5) !important;
            border-bottom: 2px solid #f87171 !important;
          }

          .filter-panel button.text-yellow-400 {
            color: #fbbf24 !important;
            border-color: rgba(251, 191, 36, 0.5) !important;
            border-bottom: 2px solid #fbbf24 !important;
          }

          .filter-panel button.text-green-400 {
            color: #4ade80 !important;
            border-color: rgba(74, 222, 128, 0.5) !important;
            border-bottom: 2px solid #4ade80 !important;
          }

          /* Tag buttons */
          .filter-panel button.text-blue-400.border-blue-400 {
            color: #60a5fa !important;
            border-color: rgba(96, 165, 250, 0.5) !important;
            border-bottom: 2px solid #60a5fa !important;
          }

          /* Clear filters button */
          .filter-panel button.text-red-400.hover\:text-red-300 {
            color: #f87171 !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            font-size: 0.875rem !important;
          }

          .filter-panel button.text-red-400.hover\:text-red-300:hover {
            color: #fca5a5 !important;
          }

          .tasks-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0 1rem;
          }

          .tasks-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #e6f2ff;
            margin: 0;
          }

          .show-more-btn {
            background: linear-gradient(135deg, #3b82f6, #7dd3fc);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .show-more-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .show-more-footer {
            padding: 1rem 1rem 0;
            text-align: center;
          }

          .show-more-link {
            color: #93c5fd;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .show-more-link:hover {
            color: #3b82f6;
          }

          .ai-fab {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #7dd3fc);
            box-shadow: 0 0 35px rgba(90, 150, 255, 0.8);
            color: #fff;
            font-size: 1.4rem;
          }

          @media (max-width: 768px) {
            .dashboard-layout {
              grid-template-columns: 1fr;
            }

            .tasks-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .show-more-btn {
              align-self: flex-end;
            }

            .view-controls {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
