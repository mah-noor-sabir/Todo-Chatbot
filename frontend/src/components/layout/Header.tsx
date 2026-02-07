/**
 * App header with sign out button, user info, and glowing title effect
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../hooks/AuthContext';
import Button from '../ui/Button';
import './Header.css';

export default function Header() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { setUser: setAuthContextUser } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    // Clear AuthContext state so ChatWidget disappears
    setAuthContextUser(null);
    router.push('/signin');
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* App Name */}
        <h1
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <span
            style={{
              fontSize: '2rem', // same size as "Taskify"
            }}
            title="Verified"
          >
            ✔
          </span>
          Taskify
        </h1>

        {user && (
          <div className="header-actions">
            {/* Welcome text */}
            <span className="header-user-email">
              Welcome, <strong>{user.email}</strong>
            </span>

            {/* Sign Out Button */}
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
