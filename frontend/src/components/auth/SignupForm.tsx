'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../lib/utils/validation';
import './authForm.css';

interface SignupFormProps {
  className?: string;
}

export default function SignupForm({ className = '' }: SignupFormProps) {
  const router = useRouter();
  const { signUp, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation || '');
    setPasswordError(passwordValidation || '');
    if (emailValidation || passwordValidation) return;

    try {
      setLoading(true);
      await signUp(email, password);
      router.push('/todos');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${className}`}>
      <div className="auth-form-box">
        {/* Header */}
        <h2 className="auth-heading">Create Account</h2>
        <p className="auth-subheading">
          Join us — it only takes a moment
        </p>

        {/* Error */}
        {authError && (
          <div className="auth-message error">
            <span className="auth-message-icon">⚠</span>
            <span className="auth-message-text">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Input */}
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">
              Email
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
              <div className="auth-message error" style={{ marginBottom: '0.5rem' }}>
                <span className="auth-message-icon">⚠</span>
                <span className="auth-message-text">{emailError}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
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
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
            {passwordError && (
              <div className="auth-message error" style={{ marginBottom: '0.5rem' }}>
                <span className="auth-message-icon">⚠</span>
                <span className="auth-message-text">{passwordError}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? <span className="spinner"></span> : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/signin" className="auth-link">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
