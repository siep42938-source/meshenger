/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand — deep blue like Telegram but with a twist
        primary: {
          50:  '#eef4ff',
          100: '#dce9ff',
          200: '#b2d0ff',
          300: '#7aadff',
          400: '#3d82ff',
          500: '#1a5cff',
          600: '#0038f5',
          700: '#002de0',
          800: '#0026b5',
          900: '#00228e',
          950: '#001460',
        },
        // Surface colors — dark theme
        surface: {
          50:  '#f5f7fa',
          100: '#eaedf2',
          200: '#d0d6e2',
          300: '#a8b4c8',
          400: '#7a8da8',
          500: '#5a6f8e',
          600: '#475a75',
          700: '#3a4a60',
          800: '#1e2a3a',
          900: '#141e2d',
          950: '#0d1520',
        },
        // Message bubble colors
        bubble: {
          out: '#1a5cff',
          in:  '#1e2a3a',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow':  '0 0 20px rgba(26,92,255,0.4)',
        'card':  '0 2px 16px rgba(0,0,0,0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-in-r': 'slideInRight 0.25s ease-out',
        'pulse-dot':  'pulseDot 1.4s ease-in-out infinite',
        'bounce-msg': 'bounceMsg 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:{ from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseDot:    { '0%,80%,100%': { transform: 'scale(0.6)', opacity: '0.4' }, '40%': { transform: 'scale(1)', opacity: '1' } },
        bounceMsg:   { from: { opacity: '0', transform: 'scale(0.8) translateY(8px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
      }
    },
  },
  plugins: [],
}
