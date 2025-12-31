/**
 * Todo list page (protected route)
 */

'use client';

import { useState, useMemo } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import TodoList from '../../components/todos/TodoList';
import AddTodoForm from '../../components/todos/AddTodoForm';
import EditTodoModal from '../../components/todos/EditTodoModal';
import DeleteConfirm from '../../components/todos/DeleteConfirm';
import SearchBar from '../../components/todos/SearchBar';
import Button from '../../components/ui/Button';
import { useTodos } from '../../hooks/useTodos';
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '../../lib/types/todo';

export default function TodosPage() {
  const { todos, loading, error, createTodo, updateTodo, toggleCompletion, deleteTodo, pendingOperations } =
    useTodos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter todos by search query
  const filteredTodos = useMemo(() => {
    if (!searchQuery.trim()) return todos;

    const query = searchQuery.toLowerCase();
    return todos.filter(todo => {
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description?.toLowerCase().includes(query);
      const matchesTags = todo.tags?.some(tag => tag.toLowerCase().includes(query));
      return matchesTitle || matchesDescription || matchesTags;
    });
  }, [todos, searchQuery]);

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
          <div className="toolbar">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, description, or tags..."
            />
            <Button className="add-todo-btn" onClick={() => setShowAddForm(true)}>
              Add Todo
            </Button>
          </div>

          {searchQuery && (
            <div style={{
              textAlign: 'center',
              color: '#cfc4ff',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              padding: '0.5rem',
              background: 'rgba(168, 136, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(168, 136, 255, 0.2)'
            }}>
              Found {filteredTodos.length} of {todos.length} todo{todos.length !== 1 ? 's' : ''}
            </div>
          )}

          <TodoList
            todos={filteredTodos}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onEdit={openEditForm}
            onDelete={openDeleteConfirm}
            pendingOperations={pendingOperations}
          />

          <AddTodoForm
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSubmit={handleCreate}
          />

          <EditTodoModal
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

          .toolbar {
            display: flex;
            gap: 1rem;
            align-items: center;
            margin-bottom: 2rem;
          }

          @media (max-width: 640px) {
            .toolbar {
              flex-direction: column;
            }
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

          :global(.todo-card) {
            background: rgba(10, 6, 20, 0.9);
            border: 1px solid rgba(168, 136, 255, 0.25);
            border-radius: 14px;
            padding: 1.2rem 1.3rem;
            margin-bottom: 1.2rem;
            box-shadow:
              0 0 18px rgba(168, 136, 255, 0.12),
              0 6px 24px rgba(0, 0, 0, 0.7);
          }

          :global(.todo-title) {
            color: #e9ddff;
            font-weight: 600;
            letter-spacing: 0.3px;
          }

          :global(.todo-description) {
            color: #cfc4ff;
          }

          @media (max-width: 640px) {
            .main-content {
              padding: 1.5rem 1rem;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
