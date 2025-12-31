/**
 * AuthGuard component - protects routes from unauthenticated access
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to signin if not authenticated
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-to-b from-[#0b1020] to-[#0f172a] text-gray-100">
        <p className="text-lg animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
