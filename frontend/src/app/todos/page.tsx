'use client';

import { useState, useEffect, useMemo } from 'react';

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
import { useAuthContext } from '../../hooks/AuthContext';
import {
  filterTodos,
  sortTodos,
  getAllTags,
} from '../../lib/utils/todoHelpers';

import type { Todo, TodoFilters, SortOption } from '../../lib/types/todo';

export default function TodosPage() {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    toggleCompletion,
    deleteTodo,
    fetchTodos,
  } = useTodos();

  const { user } = useAuthContext();
  const userName = user?.first_name || user?.email?.split('@')[0] || 'there';

  /* ───────────────── Sync with chatbot ───────────────── */
  useEffect(() => {
    const sync = () => fetchTodos();
    window.addEventListener('chatbotTodoUpdate', sync);
    return () => window.removeEventListener('chatbotTodoUpdate', sync);
  }, [fetchTodos]);

  /* ───────────────── UI state ───────────────── */
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

  /* ───────────────── Derived data ───────────────── */
  const availableTags = useMemo(() => getAllTags(todos), [todos]);

  const filteredTodos = useMemo(() => {
    const filtered = filterTodos(todos, filters);
    return sortTodos(filtered, sortBy);
  }, [todos, filters, sortBy]);

  const completedCount = todos.filter(t => t.is_completed).length;
  const pendingCount = todos.filter(t => !t.is_completed).length;

  const productivity =
    todos.length === 0
      ? 0
      : Math.round((completedCount / todos.length) * 100);

  /* ───────────────── Render ───────────────── */
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
                value={filters.searchQuery}
                onChange={(value) =>
                  setFilters({ ...filters, searchQuery: value })
                }
              />
              <Button onClick={() => setShowAddForm(true)}>
                ＋ Create
              </Button>
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
                    className={`view-btn ${
                      viewMode === 'list' ? 'active' : ''
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </button>
                  <button
                    className={`view-btn ${
                      viewMode === 'grid' ? 'active' : ''
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </button>
                </div>
              </div>

              <div className="sidebar-section">
                <h3 className="section-title">Sort</h3>
                <SortControls
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
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
                todos={filteredTodos.slice(0, 3)}
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
                    Show {filteredTodos.length - 3} more tasks…
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modals */}
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
      </div>
    </AuthGuard>
  );
}
