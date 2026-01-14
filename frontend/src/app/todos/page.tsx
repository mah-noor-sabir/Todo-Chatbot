/**
 * Todo list page (protected route)
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
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
  const { todos, loading, error, createTodo, updateTodo, toggleCompletion, deleteTodo, pendingOperations, fetchTodos } =
    useTodos();

  const [showAddForm, setShowAddForm] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for chatbot todo update events to keep UI in sync
  useEffect(() => {
    const handleChatbotTodoUpdate = () => {
      // Refetch todos when chatbot makes changes to ensure sync
      fetchTodos();
    };

    window.addEventListener('chatbotTodoUpdate', handleChatbotTodoUpdate);

    return () => {
      window.removeEventListener('chatbotTodoUpdate', handleChatbotTodoUpdate);
    };
  }, [fetchTodos]);

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
            background:
              radial-gradient(circle at top, rgba(79, 70, 229, 0.15) 0%, rgba(15, 23, 42, 0.15) 60%),
              radial-gradient(circle at bottom, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0.1) 70%),
              linear-gradient(135deg, #0f0e20 0%, #1a1b2e 50%, #0f0e20 100%);
            color: #f2ecff;
            padding-bottom: 2rem;
            position: relative;
            overflow-x: hidden;
          }

          .page-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.05) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
          }

          .page-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
              linear-gradient(transparent 50%, rgba(0, 0, 0, 0.2) 100%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(255, 255, 255, 0.02) 1px,
                rgba(255, 255, 255, 0.02) 2px
              );
            pointer-events: none;
            z-index: -1;
          }

          .main-content {
            max-width: 1100px;
            margin: 0 auto;
            padding: 2.5rem 1.5rem;
          }

          .toolbar {
            display: flex;
            gap: 1.2rem;
            align-items: center;
            margin-bottom: 2.5rem;
            position: relative;
          }

          .toolbar::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(168, 136, 255, 0.2), transparent);
          }

          @media (max-width: 640px) {
            .toolbar {
              flex-direction: column;
            }
          }

          .add-todo-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #f5f0ff;
            border-radius: 16px;
            padding: 0.8rem 1.6rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            border: none;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            box-shadow:
              0 8px 24px rgba(102, 126, 234, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            font-size: 1rem;
          }

          .add-todo-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.8s;
            z-index: 1;
          }

          .add-todo-btn:hover::before {
            left: 100%;
          }

          .add-todo-btn span {
            position: relative;
            z-index: 2;
          }

          .add-todo-btn:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow:
              0 12px 32px rgba(102, 126, 234, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.15),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
          }

          :global(.todo-card) {
            background:
              linear-gradient(135deg, rgba(10, 6, 20, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%),
              rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 1.4rem 1.5rem;
            margin-bottom: 1.4rem;
            box-shadow:
              0 12px 32px rgba(0, 0, 0, 0.4),
              inset 0 0 20px rgba(168, 85, 247, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          :global(.todo-card):hover {
            transform: translateY(-2px) scale(1.01);
            box-shadow:
              0 16px 40px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(168, 85, 247, 0.2),
              inset 0 0 25px rgba(168, 85, 247, 0.1);
          }

          :global(.todo-title) {
            color: #f8fafc;
            font-weight: 700;
            letter-spacing: -0.01em;
            font-size: 1.15rem;
            line-height: 1.4;
          }

          :global(.todo-description) {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.95rem;
            line-height: 1.5;
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
