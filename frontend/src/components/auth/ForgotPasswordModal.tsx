'use client';

import { useState, useEffect } from 'react';
import { validateEmail, validatePassword } from '../../lib/utils/validation';
import './ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    setNewPassword('');
    setMessage('');
    setEmailError('');
    setPasswordError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email and password
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(newPassword);

    setEmailError(emailValidation || '');
    setPasswordError(passwordValidation || '');

    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      setLoading(true);
      // Simulate API call - in production, integrate with backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage('Password reset successful! Please sign in with your new password.');
      setEmail('');
      setNewPassword('');
      setTimeout(() => handleClose(), 2000);
    } catch {
      setMessage('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleOverlayClick}>
      <div className="forgot-password-container">
        <div className="forgot-password-modal">
          {/* Header */}
          <div className="forgot-password-header">
            <h2 className="forgot-password-title">Reset Password</h2>
            <button
              type="button"
              className="forgot-password-close-btn"
              onClick={handleClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`forgot-password-message ${message.includes('successful') ? 'success' : 'error'}`}>
              <span className="forgot-password-message-icon">{message.includes('successful') ? '✓' : '⚠'}</span>
              <span className="forgot-password-message-text">{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="forgot-password-label required">
                Registered Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`forgot-password-input ${emailError ? 'error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
              />
              {emailError && (
                <div className="forgot-password-error">
                  <span className="forgot-password-error-text">{emailError}</span>
                </div>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="forgot-password-label required">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className={`forgot-password-input ${passwordError ? 'error' : ''}`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter new password (min 8 characters)"
                disabled={loading}
                autoComplete="new-password"
              />
              {passwordError && (
                <div className="forgot-password-error">
                  <span className="forgot-password-error-text">{passwordError}</span>
                </div>
              )}
            </div>

            <div className="forgot-password-actions">
              <button
                type="button"
                className="forgot-password-btn forgot-password-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="forgot-password-btn forgot-password-btn-primary"
                disabled={loading || !email || !newPassword}
              >
                {loading ? <span className="forgot-password-spinner"></span> : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
