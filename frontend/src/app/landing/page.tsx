'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import './landing.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* =====================
     SCROLL NAV EFFECT
  ====================== */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* =====================
     TESTIMONIAL AUTO SLIDE
  ====================== */
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setSliderIndex((prev) =>
        prev < testimonials.length - visibleCount ? prev + 1 : 0
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [paused]);

  /* =====================
     ANIMATIONS
  ====================== */
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const float = {
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 7, repeat: Infinity },
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

  /* =====================
     RESPONSIVE LOGIC
  ====================== */
  const visibleCount =
    typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;

  const moveSlider = (direction: number) => {
  setSliderIndex((prev) => {
    const maxIndex = testimonials.length - visibleCount;

    if (direction < 0) {
      return prev === 0 ? maxIndex : prev - 1;
    }

    return prev === maxIndex ? 0 : prev + 1;
  });
};


  return (
    <div className="landing-page-container">

      {/* BACKGROUND GLOWS */}
      <div className="background-neon-glows">
        <div className="neon-glow-1" />
        <div className="neon-glow-2" />
        <div className="neon-glow-3" />
      </div>

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}
      >
        <div className="navbar-content">
          <h1 className="logo-container">
            <span className="logo-verification">✔</span>
            <span className="logo-text">Taskify</span>
          </h1>

          <div className="flex items-center gap-4">
            <Link href="/signin" className="signin-link">Sign In</Link>
            <Link href="/signup" className="signup-button">Get Started</Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="hero-left"
          >
            <span className="version-tag">v2.0 is now live</span>

            <h1 className="hero-title">
              Organize your<br />
              life with <span className="gradient-text">clarity</span>
            </h1>

            <p className="hero-description">
              Taskify helps you stay focused, finish faster,
              and enjoy checking things off with style.
            </p>

            <Link href="/signup" className="cta-button">
              Start for free →
            </Link>
          </motion.div>

          <div className="floating-cards-container">
            <motion.div
              variants={float}
              animate="animate"
              whileHover={{ y: -20, scale: 1.05 }}
              className="floating-card floating-card-high-priority"
            >
              <span className="priority-badge high-priority-badge">
                HIGH PRIORITY
              </span>
              <h3 className="card-title">Complete Project</h3>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '75%' }} />
              </div>
            </motion.div>

            <motion.div
              variants={float}
              animate="animate"
              whileHover={{ y: -20, scale: 1.05 }}
              className="floating-card floating-card-pending"
            >
              <span className="priority-badge pending-badge">PENDING</span>
              <h3 className="card-title">Design Review</h3>
              <p className="card-subtitle">Tomorrow · 10:00 AM</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            Built for <span className="gradient-text">Productivity</span>
          </h2>

          <div className="features-grid">
            {[
              ['Lightning Fast', 'Real-time sync keeps everything instant.'],
              ['Secure by Design', 'Your tasks are always protected.'],
              ['Smart Organization', 'Tags, priorities, and filters.'],
              ['Progress Tracking', 'See what you finish, every day.'],
              ['Collaboration', 'Share tasks with teammates easily.'],
              ['Customizable Workflows', 'Adapt Taskify to your style.'],
            ].map(([title, desc]) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="feature-card"
              >
                <h3 className="feature-card-title">{title}</h3>
                <p className="feature-card-description">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SLIDER */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="testimonials-title">What Users Say</h2>

          <div
            className="testimonials-slider"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="testimonial-arrow left" onClick={() => moveSlider(-1)}>
              ‹
            </div>

            <div className="testimonial-arrow right" onClick={() => moveSlider(1)}>
              ›
            </div>

            <motion.div
              className="testimonials-track"
              animate={{ x: `-${sliderIndex * 452}px` }}
              transition={{ ease: 'easeInOut', duration: 0.6 }}
            >
              {testimonials.map(([name, review]) => (
                <div key={name + review} className="testimonial-card">
                  <p className="testimonial-text">“{review}”</p>
                  <span className="testimonial-author">{name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to boost your productivity?</h2>
        <div className="cta-buttons-container">
          <Link href="/signin" className="secondary-cta-button">Sign In</Link>
          <Link href="/signup" className="primary-cta-button">
            Get Started for Free
          </Link>
        </div>
      </section>

    </div>
  );
}
