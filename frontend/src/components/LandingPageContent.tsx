'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import '../app/landing/landing.css';

export default function LandingPageContent() {
  const [scrolled, setScrolled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  /* =====================
     NAV SCROLL EFFECT
  ====================== */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* =====================
     HERO CARD FLOAT
  ====================== */
  const float = {
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 6, repeat: Infinity },
    },
  };

  /* =====================
     TESTIMONIAL DATA
  ====================== */
  const testimonials = [
    ['Michael R.', 'Taskify made my workflow finally feel under control.'],
    ['Aarav Patel', 'Clean UI, lightning fast, and zero friction.'],
    ['Fatima Noor', 'I trust it with my daily planning completely.'],
    ['Daniel Brooks', 'Performance is insane — zero lag, ever.'],
    ['Rahul Verma', 'Replaced two other apps for me instantly.'],
    ['Sarah Johnson', 'Feels thoughtfully designed and polished.'],
    ['Omar Hassan', 'Task tracking feels effortless now.'],
    ['Emily Carter', 'Everything loads instantly. Love it.'],
    ['Yusuf Khan', 'Collaboration is smooth and intuitive.'],
    ['Priya Nair', 'Simple, powerful, and beautifully done.'],
  ];

  const visibleCount =
    typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;

  const CARD_WIDTH = 452;

  const clonesBefore = testimonials.slice(-visibleCount);
  const clonesAfter = testimonials.slice(0, visibleCount);
  const extended = [...clonesBefore, ...testimonials, ...clonesAfter];

  const [index, setIndex] = useState(visibleCount);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => move(1), 3500);
    return () => clearInterval(interval);
  }, [paused]);

  const move = (step: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((prev) => prev + step);
  };

  return (
    <div className="landing-page-container">

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}
      >
        <div className="navbar-content">
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
          <div className="nav-actions">
            <Link href="/signin">Sign In</Link>
            <Link href="/signup" className="primary-btn">
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-left"
          >
            <span className="version-tag">v2.0 is live</span>
            <h1>
              Organize your <br />life
              with <span>clarity</span>
            </h1>
            <p>
              Taskify helps you stay focused, finish faster,
              and enjoy checking things off.
            </p>
            <Link href="/signup" className="cta-button">
              Start for free →
            </Link>
          </motion.div>

          {/* RIGHT — MOCK TASK CARDS ✅ */}
          <div className="mock-cards">
            {/* HIGH PRIORITY */}
            <motion.div
              className="mock-card high-card"
              variants={float}
              animate="animate"
              whileHover={{ y: -20, scale: 1.05 }}
            >
              <span className="pill high">HIGH PRIORITY</span>
              <h4 className="mock-title">Complete Project</h4>

              <div className="progress-track">
                <span className="progress-fill" style={{ width: '50%' }} />
              </div>
            </motion.div>

            {/* PENDING */}
            <motion.div
              className="mock-card pending-card"
              variants={float}
              animate="animate"
              whileHover={{ y: -20, scale: 1.05 }}
            >
              <span className="pill pending">PENDING</span>
              <h4 className="mock-title">Design Review</h4>
              <p className="mock-time">Tomorrow · 10:00 AM</p>
            </motion.div>
          </div>


        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">
            Built for <span>Productivity</span>
          </h2>

          <div className="features-grid">
            {[
              ['Lightning Fast', 'Real-time sync with zero lag.'],
              ['Secure by Design', 'Your data is encrypted and protected.'],
              ['Smart Organization', 'Tags, priorities, and filters.'],
              ['Progress Tracking', 'See what you finish, every day.'],
              ['Team Collaboration', 'Work together effortlessly.'],
              ['Custom Workflows', 'Adapt Taskify to your style.'],
            ].map(([title, desc]) => (
              <div key={title} className="feature-card">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2 className="section-title">What Users Say</h2>

        <div
          className="testimonials-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="testimonial-arrow left" onClick={() => move(-1)}>
            ‹
          </button>

          <button className="testimonial-arrow right" onClick={() => move(1)}>
            ›
          </button>

          <motion.div
            className="testimonials-track"
            animate={{ x: `-${index * CARD_WIDTH}px` }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              setIsAnimating(false);
              if (index >= testimonials.length + visibleCount) {
                setIndex(visibleCount);
              }
              if (index <= 0) {
                setIndex(testimonials.length);
              }
            }}
          >
            {extended.map(([name, review], i) => (
              <div key={`${name}-${i}`} className="testimonial-card">
                <p>“{review}”</p>
                <span>{name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to boost your productivity?</h2>
        <div className="cta-buttons">
          <Link href="/signin" className="secondary-btn large">
            Sign In
          </Link>
          <Link href="/signup" className="primary-btn large">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}