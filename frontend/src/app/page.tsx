'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPageContent from '../components/LandingPageContent'; // Import the shared landing page component

export default function Home() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  // Check for auth status on client side and redirect appropriately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('better_auth_token');
      if (token) {
        // User is authenticated, redirect to todos
        setAuthState('authenticated');
        router.push('/todos');
      } else {
        // User is not authenticated, show landing content directly
        setAuthState('unauthenticated');
      }
    }
  }, [router]);

  // If user is authenticated, return null since redirect is happening
  if (authState === 'authenticated') {
    return null;
  }

  // If still checking auth, return null temporarily
  if (authState === 'checking') {
    // Optionally return a minimal loader here
    return null;
  }

  // If unauthenticated, render the landing page content directly
  return <LandingPageContent />;
}
