/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#071318',
          1: '#0b1b22',
          2: '#10252d',
          3: '#17323b',
        },
        panel: {
          DEFAULT: 'rgba(18, 39, 47, 0.82)',
          strong: '#132a33',
        },
        line: {
          DEFAULT: 'rgba(239, 229, 207, 0.10)',
          strong: 'rgba(239, 229, 207, 0.18)',
        },
        cream: {
          DEFAULT: '#f2ead9',
          2: '#d9cfba',
        },
        muted: '#9faeaa',
        gold: {
          DEFAULT: '#d4ac3f',
          2: '#f0ce68',
        },
        accent: {
          green: '#68d59d',
          red: '#ef7c78',
          orange: '#e9ae52',
          blue: '#7fc3df',
          violet: '#b99be7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
        sm: '10px',
      },
      boxShadow: {
        card: '0 12px 36px rgba(0,0,0,.10)',
        heavy: '0 22px 70px rgba(0, 0, 0, .28)',
        toast: '0 14px 45px rgba(0,0,0,.35)',
      },
    },
  },
  plugins: [],
};
