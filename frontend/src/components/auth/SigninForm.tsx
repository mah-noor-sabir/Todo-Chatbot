'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../hooks/AuthContext';
import { validateEmail } from '../../lib/utils/validation';
import './authForms.css';
import ForgotPasswordModal from './ForgotPasswordModal';

interface SigninFormProps {
  className?: string;
}

export default function SigninForm({ className = '' }: SigninFormProps) {
  const router = useRouter();
  const { signIn, error: authError } = useAuth();
  const { refreshSession } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    const passwordValidationError = password ? '' : 'Password is required';

    setEmailError(emailValidationError || '');
    setPasswordError(passwordValidationError || '');

    if (emailValidationError || passwordValidationError) return;

    try {
      setLoading(true);
      await signIn(email.trim().toLowerCase(), password);
      // Refresh AuthContext session so ChatWidget knows user is logged in
      await refreshSession();
      router.push('/todos');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-wrapper">
      {/* Left Side - Greeting Panel */}
      <div className="greeting-panel">
        <div className="greeting-content">
          <div className="greeting-logo">Taskify</div>
          <h1 className="greeting-title">Welcome Back</h1>
          <p className="greeting-subtitle">Sign in to continue managing your tasks efficiently</p>

          <div className="greeting-features">
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>Your tasks are synced securely</span>
            </div>
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>Access anywhere, anytime</span>
            </div>
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>All your progress is saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="form-panel">
        <div className={`auth-container ${className}`}>
          <div className="auth-form-box">
            {/* Back to Home Button - now inside the form box */}
            <a href="/" className="back-to-home">
              <span className="back-to-home-icon">←</span>
              <span>Back to Home</span>
            </a>

            {/* Heading */}
            <h2 className="auth-heading">Sign In</h2>
            <p className="auth-subheading">
              Welcome back! Enter your credentials to continue.
            </p>

            {/* Auth Error */}
            {authError && (
              <div className="auth-message error">
                <span className="auth-message-icon">⚠</span>
                <span className="auth-message-text">{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="email" className="auth-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className={`auth-input ${emailError ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {emailError && (
                  <div className="auth-message error">
                    <span className="auth-message-icon">⚠</span>
                    <span className="auth-message-text">{emailError}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${passwordError ? 'error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      // Eye Off Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      // Eye Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="auth-message error">
                    <span className="auth-message-icon">⚠</span>
                    <span className="auth-message-text">{passwordError}</span>
                  </div>
                )}
              </div>

              {/* Forgot Password */}
              <div className="auth-forgot-password">
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <p className="auth-footer">
              Don’t have an account?{' '}
              <a href="/signup" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
