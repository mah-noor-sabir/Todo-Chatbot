/**
 * Dashboard-style Todo page (Glassy Blue Theme)
 */

'use client';

import { useState, useMemo } from 'react';
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
  const { todos, loading, error, createTodo, updateTodo, toggleCompletion, deleteTodo } =
    useTodos();

  const { user } = useAuthContext();
  const userName = user?.first_name || user?.email?.split('@')[0] || 'there';

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<TodoFilters>({
    status: 'all',
    priority: 'all',
    tags: [],
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState<SortOption>('created_at');

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

        <main className="container">
          {/* Dashboard Header */}
          <div className="dashboard-header glass">
            <div>
              <h1 className="gradient-title">Dashboard</h1>
              <p>
                Hello{' '}
                <strong className="text-white">{userName}</strong>,{' '}
                {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} remaining
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
            {/* Productivity – big card */}
            <div className="stat-card large glass">
              <span>Productivity</span>
              <h2>{productivity}%</h2>
              <div className="progress">
                <div style={{ width: `${productivity}%` }} />
              </div>
            </div>

            {/* Completed */}
            <div className="stat-card small glass">
              <span>Completed</span>
              <h3>{completedCount}</h3>
            </div>

            {/* Pending Tasks */}
            <div className="stat-card small glass">
              <span>Pending Tasks</span>
              <h3>{pendingCount}</h3>
            </div>
          </div>

          {/* Controls */}
          <div className="controls glass">
            <button onClick={() => setShowFilters(!showFilters)}>Filters</button>
            <SortControls sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {showFilters && (
            <FilterPanel
              filters={filters}
              availableTags={availableTags}
              onFilterChange={setFilters}
            />
          )}

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
          />
        </main>

        <button className="ai-fab">✨</button>

        <AddTodoForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={createTodo} />
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

          .container {
            max-width: 1200px;
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
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
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

          .controls {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .controls button {
            background: rgba(20, 40, 80, 0.6);
            border: 1px solid rgba(90, 150, 255, 0.35);
            color: #cfe6ff;
            padding: 0.6rem 1.2rem;
            border-radius: 12px;
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
        `}</style>
      </div>
    </AuthGuard>
  );
}
