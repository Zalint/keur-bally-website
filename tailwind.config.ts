import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF6E9',
          dark: '#F2EDD8',
          border: '#E8E1C9',
        },
        kb: {
          green: '#1B5E20',
          'green-dark': '#154A1A',
          'green-soft': '#E7F0E8',
          bordeaux: '#7B1F2F',
          'bordeaux-dark': '#5F1623',
          gold: '#B8860B',
          'gold-soft': '#F2E6C2',
          ink: '#1A1A1A',
          olive: '#6B6B5E',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,94,32,0.04)',
        pack: '0 8px 24px rgba(27,94,32,0.12)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
