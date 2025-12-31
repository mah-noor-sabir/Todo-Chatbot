'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../lib/types/user';
import { authApi } from '../lib/api/auth';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    // Fetch session once
    (async () => {
      try {
        const data = await authApi.getSession();
        setUser(data);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};
