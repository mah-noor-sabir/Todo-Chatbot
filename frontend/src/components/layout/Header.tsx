/**
 * App header with sign out button, user info, and glowing title effect
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import './Header.css';

export default function Header() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <h1 style={{ color: '#c4b5fd' }}>
          Evolution of Todo
        </h1>

        {user && (
          <div className="header-actions">
            {/* Optional Welcome Text */}
            <span className="header-user-email">
              Welcome, <strong>{user.email}</strong>
            </span>

            {/* Sign Out Button with hover effect */}
            <Button
              variant="secondary"
              onClick={handleSignOut}
              className="header-btn glow-btn"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
