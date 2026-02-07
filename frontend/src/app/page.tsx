'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for auth status on client side
  useEffect(() => {
    // Check for auth token in localStorage (more reliable than cookies for client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('better_auth_token');
      if (token) {
        setIsAuthenticated(true);
        router.push('/todos');
      }
    }
  }, [router]);

  // Show a simple loading state while checking auth
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('better_auth_token');
    if (token) {
      return null; // Will redirect via useEffect
    }
  }

  // If not authenticated, redirect to the new landing page
  useEffect(() => {
    router.push('/landing');
  }, [router]);

  return null;
}
