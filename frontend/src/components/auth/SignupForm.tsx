'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../hooks/AuthContext';
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../../lib/utils/validation';
import './authForms.css';

interface SignupFormProps {
  className?: string;
}

export default function SignupForm({ className = '' }: SignupFormProps) {
  const router = useRouter();
  const { signUp, error: authError } = useAuth();
  const { refreshSession } = useAuthContext();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error state
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields (last name is optional)
    const firstNameValidation = validateFirstName(firstName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    // Set all errors (skip last name validation)
    setFirstNameError(firstNameValidation || '');
    setEmailError(emailValidation || '');
    setPasswordError(passwordValidation || '');
    setConfirmPasswordError(confirmPasswordValidation || '');

    // If any validation fails (except last name), don't submit
    if (
      firstNameValidation ||
      emailValidation ||
      passwordValidation ||
      confirmPasswordValidation
    ) {
      return;
    }

    try {
      setLoading(true);
      // Pass undefined for last name if not provided
      const lastNameValue = lastName.trim() || undefined;
      await signUp(firstName.trim(), lastNameValue, email.trim().toLowerCase(), password);
      // Refresh AuthContext session so ChatWidget knows user is logged in
      await refreshSession();
      router.push('/todos');
    } catch (error) {
      setLoading(false);
      // Error is already handled by the useAuth hook
    }
  };

  // Clear error when user starts typing
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (firstNameError) setFirstNameError('');
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    // Clear error for last name since it's optional
    if (lastNameError) setLastNameError('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError('');
    // Re-validate confirm password if it has a value
    if (confirmPassword && confirmPasswordError) {
      const confirmValidation = validateConfirmPassword(value, confirmPassword);
      setConfirmPasswordError(confirmValidation || '');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="auth-wrapper">
      {/* Left Side - Greeting Panel */}
      <div className="greeting-panel">
        <div className="greeting-content">
          <div className="greeting-logo">Taskify</div>
          <h1 className="greeting-title">Welcome to Taskify</h1>
          <p className="greeting-subtitle">Join thousands of productive individuals managing their tasks efficiently</p>

          <div className="greeting-features">
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>Secure & Private</span>
            </div>
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>Real-time Sync</span>
            </div>
            <div className="greeting-feature">
              <span className="greeting-feature-icon">✓</span>
              <span>Cross-platform Support</span>
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

            {/* Header */}
            <h2 className="auth-heading">Create Account</h2>
            <p className="auth-subheading">
              Join us — it only takes a moment
            </p>

            {/* Global Error */}
            {authError && (
              <div className="auth-message error">
                <span className="auth-message-icon">⚠</span>
                <span className="auth-message-text">{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name Row - First and Last Name */}
              <div className="auth-input-row">
                {/* First Name */}
                <div className="auth-input-group">
                  <label htmlFor="firstName" className="auth-label required">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className={`auth-input ${firstNameError ? 'error' : ''}`}
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    placeholder="John"
                    autoComplete="given-name"
                    disabled={loading}
                  />
                  {firstNameError && (
                    <div className="auth-field-error">
                      {firstNameError}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="auth-input-group">
                  <label htmlFor="lastName" className="auth-label">
                    Last Name (optional)
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className={`auth-input ${lastNameError ? 'error' : ''}`}
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    placeholder="Doe"
                    autoComplete="family-name"
                    disabled={loading}
                  />
                  {lastNameError && (
                    <div className="auth-field-error">
                      {lastNameError}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="auth-input-group">
                <label htmlFor="email" className="auth-label required">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`auth-input ${emailError ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
                {emailError && (
                  <div className="auth-field-error">
                    {emailError}
                  </div>
                )}
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="auth-input-group">
                <label htmlFor="password" className="auth-label required">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${passwordError ? 'error' : ''}`}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={loading}
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
                  <div className="auth-field-error">
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Confirm Password Input with Visibility Toggle */}
              <div className="auth-input-group">
                <label htmlFor="confirmPassword" className="auth-label required">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`auth-input ${confirmPasswordError ? 'error' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
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
                {confirmPasswordError && (
                  <div className="auth-field-error">
                    {confirmPasswordError}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`auth-button auth-button-primary ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
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
      </div>
    </div>
  );
}
