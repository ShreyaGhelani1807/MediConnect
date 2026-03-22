/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Sora', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff9f7',
          100: '#d9f2ec',
          400: '#2cc2a2',
          500: '#13b997',
          600: '#0f9d83',
          700: '#0c7d6a',
        },
        indigo: {
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
        },
        slate: {
          50:  '#f6f8fb',
          100: '#eef2f7',
          200: '#e2e8f0',
          300: '#c7d2e0',
          400: '#8fa0b3',
          500: '#5f6f82',
          600: '#445268',
          700: '#314058',
          800: '#1f2b3f',
          900: '#0b1f36',
        },
        emerald: { 500: '#10B981' },
        amber:   { 500: '#F59E0B' },
        orange:  { 500: '#F97316' },
        red:     { 500: '#EF4444' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #13b997, #2563eb)',
        'gradient-mesh': `
          radial-gradient(ellipse at 20% 50%, rgba(19,185,129,0.14) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(99,102,241,0.08) 0%, transparent 50%)
        `,
      },
      boxShadow: {
        'card':    '0 1px 2px rgba(15,23,42,0.06), 0 16px 40px rgba(15,23,42,0.08)',
        'card-hover': '0 4px 10px rgba(15,23,42,0.08), 0 24px 60px rgba(15,23,42,0.12)',
        'btn':     '0 10px 28px rgba(19,185,129,0.35)',
        'glow-red': '0 0 22px rgba(239,68,68,0.28)',
        'glow-green': '0 0 22px rgba(16,185,129,0.28)',
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