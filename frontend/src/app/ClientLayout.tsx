/**
 * Client-side layout wrapper
 * Provides AuthProvider context and ChatWidget for all pages
 */

'use client';

import { useEffect } from 'react';
import { AuthProvider } from '../hooks/AuthContext';
import ChatWidget from '../components/chat/ChatWidget';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('🏗️ ClientLayout mounted');
  }, []);

  return (
    <AuthProvider>
      {children}
      {/* ChatWidget should appear on all pages when authenticated */}
      <ChatWidget />
    </AuthProvider>
  );
}
