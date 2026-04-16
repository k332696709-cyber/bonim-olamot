import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#003366',
          50:  '#e6edf5',
          100: '#ccdaeb',
          200: '#99b5d7',
          300: '#6691c3',
          400: '#336caf',
          500: '#003366',
          600: '#002952',
          700: '#001f3d',
          800: '#001529',
          900: '#000a14',
        },
        burgundy: {
          DEFAULT: '#800020',
          50:  '#f9e6ea',
          100: '#f2ccd4',
          200: '#e599a9',
          300: '#d8667e',
          400: '#cb3353',
          500: '#800020',
          600: '#66001a',
          700: '#4d0013',
          800: '#33000d',
          900: '#1a0006',
        },
      },
      fontFamily: {
        sans:  ['Heebo', 'sans-serif'],
        serif: ['"Frank Ruhl Libre"', 'serif'],
      },
      boxShadow: {
        luxury: '0 4px 24px 0 rgba(0,51,102,0.10)',
        card:   '0 2px 12px 0 rgba(0,51,102,0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config
