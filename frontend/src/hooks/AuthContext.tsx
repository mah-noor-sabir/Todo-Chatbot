/**
 * Authentication Context Provider
 * Manages global auth state and checks session once on mount
 * Treats 401 as normal "not authenticated" state (no retries or errors)
 */

'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User } from '../lib/types/user';
import { authApi } from '../lib/api/auth';
import { ApiClientError } from '../lib/api/client';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedSession = useRef(false);
  const isAuthenticated = !!user;

  const refreshSession = async () => {
    hasCheckedSession.current = false; // Allow re-check
    setIsLoading(true);

    try {
      const data = await authApi.getSession();
      setUser(data);
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 401) {
        setUser(null);
      } else {
        console.warn('Session refresh failed:', error);
        setUser(null);
      }
    } finally {
      hasCheckedSession.current = true;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    console.log('🔐 AuthProvider: Checking session (one-time)...');

    (async () => {
      try {
        const data = await authApi.getSession();
        console.log('✅ AuthProvider: Session found:', data.email);
        setUser(data);
      } catch (error) {
        // 401 is expected when not logged in - treat as normal state
        if (error instanceof ApiClientError && error.statusCode === 401) {
          console.log('ℹ️ AuthProvider: Not authenticated (401) - this is normal');
        } else {
          // Only log unexpected errors
          console.warn('⚠️ AuthProvider: Session check failed:', error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // Empty deps = run once on mount

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isLoading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};
