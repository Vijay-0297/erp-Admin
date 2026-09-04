/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b8d1ff',
          300: '#8ab0ff',
          400: '#5c8bff',
          500: '#3563e9',
          600: '#274bc4',
          700: '#1f3b9c',
          800: '#1c3280',
          900: '#1b2c68',
          950: '#121a42',
        },
        ink: {
          50: '#f5f6f8',
          100: '#e7e9ee',
          200: '#cbd0db',
          300: '#a3abbe',
          400: '#75809a',
          500: '#57617c',
          600: '#444d65',
          700: '#383f53',
          800: '#252a38',
          900: '#161923',
          950: '#0c0e14',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(12, 14, 20, 0.04), 0 1px 6px -2px rgba(12, 14, 20, 0.06)',
      },
    },
  },
  plugins: [],
}
