/**
 * Authentication state management hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api/auth';
import type { User } from '../lib/types/user';
import { ApiClientError } from '../lib/api/client';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check current session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getSession();
      setUser(userData);
    } catch {
      setUser(null); // No valid session
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authApi.signup({ email, password });
      setUser(userData);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authApi.signin({ email, password });
      setUser(userData);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError('Sign in failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authApi.signout();
    } catch (err) {
      console.error('Signout error:', err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signUp,
    signIn,
    signOut,
    error,
  };
}
