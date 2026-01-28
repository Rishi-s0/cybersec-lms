/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HackTheBox inspired colors
        htb: {
          black: '#0d1117',
          dark: '#161b22',
          darker: '#21262d',
          green: '#9fef00',
          'green-dark': '#7cb518',
          'green-light': '#b8ff29',
          gray: '#8b949e',
          'gray-light': '#c9d1d9',
          'gray-dark': '#484f58',
          orange: '#ff6b35',
          red: '#f85149',
          blue: '#58a6ff',
          purple: '#a5a5ff',
        },
        // Keep some utility colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 1s infinite',
      },
      keyframes: {
        'glow-green': {
          '0%': { boxShadow: '0 0 5px #9fef00, 0 0 10px #9fef00, 0 0 15px #9fef00' },
          '100%': { boxShadow: '0 0 10px #9fef00, 0 0 20px #9fef00, 0 0 30px #9fef00' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        blink: {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 }
        }
      }
    },
  },
  plugins: [],
}