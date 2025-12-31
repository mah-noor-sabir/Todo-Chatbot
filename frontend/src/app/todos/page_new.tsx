/**
 * Enhanced Todo list page with search, filter, and sort
 */

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
import { notificationManager } from '../../lib/utils/notifications';
import { filterTodos, sortTodos, getAllTags } from '../../lib/utils/todoHelpers';
import type {
  Todo,
  TodoCreateRequest,
  TodoUpdateRequest,
  TodoFilters,
  SortOption,
} from '../../lib/types/todo';

export default function TodosPage() {
  const { todos, loading, error, createTodo, updateTodo, toggleCompletion, deleteTodo } =
    useTodos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState<TodoFilters>({
    status: 'all',
    priority: 'all',
    tags: [],
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState<SortOption>('created_at');

  // Request notification permission on mount
  useEffect(() => {
    if (notificationManager.isSupported()) {
      notificationManager.requestPermission();
    }
  }, []);

  // Schedule notifications for todos with due dates
  useEffect(() => {
    todos.forEach((todo) => {
      if (todo.due_date && !todo.is_completed) {
        notificationManager.scheduleNotification(
          todo.id,
          todo.title,
          todo.due_date,
          15 // 15 minutes before
        );
      } else {
        notificationManager.cancelNotification(todo.id);
      }
    });

    return () => {
      notificationManager.cancelAllNotifications();
    };
  }, [todos]);

  // Get available tags
  const availableTags = useMemo(() => getAllTags(todos), [todos]);

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = filterTodos(todos, filters);
    return sortTodos(filtered, sortBy);
  }, [todos, filters, sortBy]);

  const handleCreate = async (data: TodoCreateRequest) => {
    await createTodo(data);
    setShowAddForm(false);
  };

  const handleEdit = async (id: number, data: TodoUpdateRequest) => {
    await updateTodo(id, data);
    setShowEditForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
    setShowDeleteConfirm(false);
  };

  const handleToggle = async (id: number, is_completed: boolean) => {
    await toggleCompletion(id, is_completed);
  };

  const openEditForm = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowEditForm(true);
  };

  const openDeleteConfirm = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowDeleteConfirm(true);
  };

  return (
    <AuthGuard>
      <div className="page-container">
        <Header />

        <main className="main-content">
          {/* Toolbar with Search, Filter, Sort, and Add Todo */}
          <div className="toolbar-section">
            <div className="search-filter-row">
              <SearchBar
                value={filters.searchQuery || ''}
                onChange={(value) => setFilters({ ...filters, searchQuery: value })}
                placeholder="Search todos by title, description, or tag..."
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </button>
            </div>

            {showFilters && (
              <FilterPanel
                filters={filters}
                availableTags={availableTags}
                onFilterChange={setFilters}
              />
            )}

            <div className="sort-add-row">
              <SortControls sortBy={sortBy} onSortChange={setSortBy} />
              <Button className="add-todo-btn" onClick={() => setShowAddForm(true)}>
                + Add Todo
              </Button>
            </div>

            {/* Results count */}
            <div className="results-count">
              {filteredAndSortedTodos.length} of {todos.length} todo
              {todos.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Todo List */}
          <TodoList
            todos={filteredAndSortedTodos}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onEdit={openEditForm}
            onDelete={openDeleteConfirm}
          />

          {/* Modals */}
          <AddTodoForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSubmit={handleCreate}
          />

          <EditTodoForm
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            todo={selectedTodo}
            onSubmit={handleEdit}
          />

          <DeleteConfirm
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            todo={selectedTodo}
            onConfirm={handleDelete}
          />
        </main>

        <style jsx>{`
          .page-container {
            min-height: 100vh;
            background: radial-gradient(
                circle at top,
                #2b145a 0%,
                #0b0614 60%
              ),
              #000;
            color: #f2ecff;
            padding-bottom: 2rem;
          }

          .main-content {
            max-width: 1100px;
            margin: 0 auto;
            padding: 2.5rem 1.5rem;
          }

          .toolbar-section {
            background: rgba(10, 6, 20, 0.6);
            border: 1px solid rgba(168, 136, 255, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 0 20px rgba(168, 136, 255, 0.1);
          }

          .search-filter-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .filter-toggle-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(168, 136, 255, 0.3);
            border-radius: 12px;
            color: #cfc4ff;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
          }

          .filter-toggle-btn:hover {
            border-color: rgba(168, 136, 255, 0.6);
            background: rgba(15, 23, 42, 0.95);
          }

          .filter-toggle-btn.active {
            background: rgba(168, 136, 255, 0.2);
            border-color: rgba(168, 136, 255, 0.8);
            color: #e9ddff;
          }

          .sort-add-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
          }

          .add-todo-btn {
            background: #000;
            color: #f5f0ff;
            border-radius: 12px;
            padding: 0.7rem 1.4rem;
            font-weight: 600;
            letter-spacing: 0.4px;
            border: 1px solid rgba(168, 136, 255, 0.45);
            transition:
              box-shadow 0.35s,
              transform 0.25s,
              background-color 0.35s;
          }

          .add-todo-btn:hover {
            background-color: #05010a;
            box-shadow:
              0 0 12px rgba(168, 136, 255, 0.8),
              0 0 28px rgba(122, 92, 255, 0.6);
            transform: translateY(-2px);
          }

          .results-count {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(168, 136, 255, 0.15);
            text-align: center;
            color: #cfc4ff;
            font-size: 0.9rem;
          }

          @media (max-width: 640px) {
            .main-content {
              padding: 1.5rem 1rem;
            }

            .search-filter-row {
              flex-direction: column;
            }

            .sort-add-row {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
