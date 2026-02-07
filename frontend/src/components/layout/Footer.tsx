'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Footer.css';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on auth pages
  if (pathname?.startsWith('/signin') || pathname?.startsWith('/signup')) {
    return null;
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/todos', label: 'Dashboard' },
    { href: '/signin', label: 'Sign In' },
    { href: '/signup', label: 'Sign Up' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section - Logo and Caption */}
          <div className="footer-left">
            <Link href="/" className="footer-logo">
              <span className="footer-logo-icon">✔</span>
              <span>Taskify</span>
            </Link>
            <p className="footer-caption">
              Organize your tasks efficiently and boost productivity with clarity.
            </p>
          </div>

          {/* Right Section - Quick Links */}
          <div className="footer-right">
            <h3 className="footer-links-title">Quick Links</h3>
            <nav className="footer-links">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`footer-link ${
                    pathname === link.href ? 'active' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          © 2026 Taskify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
