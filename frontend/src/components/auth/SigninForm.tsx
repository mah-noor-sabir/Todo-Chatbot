'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../lib/utils/validation';
import './authForm.css';
import ForgotPasswordModal from './ForgotPasswordModal';

interface SigninFormProps {
  className?: string;
}

export default function SigninForm({ className = '' }: SigninFormProps) {
  const router = useRouter();
  const { signIn, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    const passwordValidationError = password ? '' : 'Password is required';

    setEmailError(emailValidationError || '');
    setPasswordError(passwordValidationError || '');

    if (emailValidationError || passwordValidationError) return;

    try {
      setLoading(true);
      await signIn(email, password);
      router.push('/todos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${className}`}>
      <div className="auth-form-box">
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
            <input
              id="password"
              type="password"
              className={`auth-input ${passwordError ? 'error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
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
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
