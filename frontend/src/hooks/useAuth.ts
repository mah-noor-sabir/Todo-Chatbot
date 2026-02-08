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
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check current session on mount with caching
  useEffect(() => {
    const cachedSession = localStorage.getItem('userSession');
    if (cachedSession) {
      try {
        const sessionData = JSON.parse(cachedSession);
        setUser(sessionData.user);
        setIsLoading(false);
        return; // Skip API call if we have valid cached session
      } catch {
        // If parsing fails, clear the cache and continue with API call
        localStorage.removeItem('userSession');
      }
    }

    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getSession();
      setUser(userData);
      // Cache session data locally
      localStorage.setItem('userSession', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
    } catch {
      setUser(null); // No valid session
      localStorage.removeItem('userSession'); // Clear invalid cache
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await authApi.signup({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      setUser(userData);
      // Cache session data locally
      localStorage.setItem('userSession', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
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
      // Cache session data locally
      localStorage.setItem('userSession', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
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
      // Clear cached session
      localStorage.removeItem('userSession');
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
