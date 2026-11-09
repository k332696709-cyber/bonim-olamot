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
        sans:  ['"IBM Plex Sans Hebrew"', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Sans Hebrew"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:    '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        luxury: '0 30px 60px -12px rgba(0,21,41,0.18)',
        card:   '0 20px 50px -10px rgba(0,21,41,0.10)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config
