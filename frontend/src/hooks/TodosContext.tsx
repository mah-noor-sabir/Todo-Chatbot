'use client';
import { createContext, useContext, useState } from 'react';
import type { Todo } from '../lib/types/todo';

interface TodosContextValue {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

const TodosContext = createContext<TodosContextValue | undefined>(undefined);

export const TodosProvider = ({
  children,
  initialTodos = [],
}: {
  children: React.ReactNode;
  initialTodos?: Todo[];
}) => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  return (
    <TodosContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodosContext = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodosContext must be used inside TodosProvider');
  return ctx;
};
