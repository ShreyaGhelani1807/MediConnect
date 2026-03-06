/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        emerald: { 500: '#10B981' },
        amber:   { 500: '#F59E0B' },
        orange:  { 500: '#F97316' },
        red:     { 500: '#EF4444' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0EA5E9, #6366F1)',
        'gradient-mesh': `
          radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 50%)
        `,
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.04), 0 10px 40px rgba(14,165,233,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(14,165,233,0.12)',
        'btn':     '0 8px 25px rgba(14,165,233,0.35)',
        'glow-red': '0 0 20px rgba(239,68,68,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};