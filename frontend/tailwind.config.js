/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* ---------- COLORS ---------- */
      colors: {
        /* Primary Gradient */
        "primary-start": "#667eea",
        "primary-end": "#764ba2",

        /* Accent / Secondary */
        "secondary-start": "#f093fb",
        "secondary-end": "#f5576c",

        /* Neon Effects */
        "neon-blue": "rgba(102, 126, 234, 0.75)",
        "neon-blue-soft": "rgba(102, 126, 234, 0.35)",

        /* Dark Theme */
        "dark-bg-main": "#0b1020",
        "dark-bg-secondary": "#0f172a",

        /* Glassmorphism */
        "glass-bg": "rgba(15, 23, 42, 0.6)",
        "glass-border": "rgba(255, 255, 255, 0.06)",

        /* Text */
        "text-primary": "#e5e7eb",
        "text-secondary": "#94a3b8",
      },

      /* ---------- ANIMATION ---------- */
      animation: {
        float: "float 7s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },

  plugins: [],
};
