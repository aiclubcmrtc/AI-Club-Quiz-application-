/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        card: '#0f172a',
        'card-elevated': '#162038',
        border: 'rgba(255, 255, 255, 0.08)',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        cmrtc: {
          gold: '#f59e0b',
          blue: '#2563eb',
          navy: '#0b1329',
          crimson: '#dc2626',
        },
        choice: {
          red: '#e74c3c',
          'red-hover': '#c0392b',
          blue: '#2e86de',
          'blue-hover': '#0984e3',
          yellow: '#f1c40f',
          'yellow-hover': '#f39c12',
          green: '#27ae60',
          'green-hover': '#219653',
        },
        matrix: {
          DEFAULT: '#00ff41',
          dim: '#008f11',
          dark: '#003b00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Baloo 2"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float 8s ease-in-out 1s infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
