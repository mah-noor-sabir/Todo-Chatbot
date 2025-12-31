/**
 * Reusable Modal dialog – glass/dark theme with accessibility
 */
'use client';

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trap, keyboard support, and body scroll handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus first input/button when modal opens
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement
      >('input, textarea, select, button');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

    // Handle Escape key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative max-w-md w-full p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl shadow-2xl transition-all transform scale-100 animate-fadeIn"
          style={{
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), 0 20px 60px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2
              id="modal-title"
              className="text-2xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-100"
            >
              {title}
            </h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="text-2xl font-bold text-gray-300 hover:text-white transition-colors hover:rotate-90 transform duration-200"
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Modal content */}
          <div className="text-gray-100">{children}</div>
        </div>
      </div>

      {/* Keyframes for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
