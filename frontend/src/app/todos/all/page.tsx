'use client';

import { useState, useEffect, useMemo } from 'react';

import AuthGuard from '../../../components/auth/AuthGuard';
import Header from '../../../components/layout/Header';
import TodoList from '../../../components/todos/TodoList';
import AddTodoForm from '../../../components/todos/AddTodoForm';
import EditTodoForm from '../../../components/todos/EditTodoForm';
import DeleteConfirm from '../../../components/todos/DeleteConfirm';
import SearchBar from '../../../components/todos/SearchBar';
import FilterPanel from '../../../components/todos/FilterPanel';
import SortControls from '../../../components/todos/SortControls';
import Button from '../../../components/ui/Button';

import { useTodos } from '../../../hooks/useTodos';
import { useAuthContext } from '../../../hooks/AuthContext';
import {
  filterTodos,
  sortTodos,
  getAllTags,
} from '../../../lib/utils/todoHelpers';

import type { Todo, TodoFilters, SortOption } from '../../../lib/types/todo';

export default function AllTodosPage() {
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

  const totalCount = todos.length;

  /* ───────────────── Render ───────────────── */
  return (
    <AuthGuard>
      <div className="page">
        <Header />

        <main className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header glass">
            <div className="space-y-1">
              <h1 className="gradient-title">All Tasks</h1>
              <p className="text-sm text-white/60">
                Hello{' '}
                <strong className="font-semibold text-white">
                  {userName}
                </strong>
                , you have{' '}
                <span className="font-medium text-blue-400">
                  {totalCount}
                </span>{' '}
                {totalCount === 1 ? 'task' : 'tasks'} in total.
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

          {/* Main Content */}
          <div className="main-content">
            <div className="tasks-header">
              <h2 className="tasks-title">All Tasks</h2>
              <a href="/todos" className="show-more-btn">
                Back to Dashboard
              </a>
            </div>

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
              viewMode={viewMode}
            />
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