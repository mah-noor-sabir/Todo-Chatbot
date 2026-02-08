/**
 * Authentication Context Provider
 * Manages global auth state and checks session once on mount.
 * Treats 401 as normal "not authenticated" state.
 * Handles network failures gracefully (backend offline, connection refused, etc.)
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
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    hasCheckedSession.current = false; // Allow re-check
    setIsLoading(true);

    try {
      const data = await authApi.getSession();
      setUser(data);
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.statusCode === 401) {
          setUser(null);
        } else if (error.message.includes('Unable to connect')) {
          console.warn('⚠️ AuthProvider: Backend unreachable. Make sure API server is running.');
          setUser(null);
        } else {
          console.warn('⚠️ AuthProvider: Session refresh failed:', error);
          setUser(null);
        }
      } else {
        console.error('Unexpected error during session refresh:', error);
        setUser(null);
      }
    } finally {
      hasCheckedSession.current = true;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only run in browser environment to prevent SSR issues
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

    console.log('🔐 AuthProvider: Checking session (one-time)...');

    (async () => {
      try {
        const data = await authApi.getSession();
        console.log('✅ AuthProvider: Session found:', data.email);
        setUser(data);
      } catch (error) {
        if (error instanceof ApiClientError) {
          if (error.statusCode === 401) {
            console.log('ℹ️ AuthProvider: Not authenticated (401) - this is normal');
          } else if (error.message.includes('Unable to connect')) {
            console.warn('⚠️ AuthProvider: Backend unreachable. Make sure API server is running.');
          } else {
            console.warn('⚠️ AuthProvider: Session check failed:', error);
          }
        } else {
          console.error('Unexpected error during session check:', error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
