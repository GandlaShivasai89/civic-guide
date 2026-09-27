/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c2d9ea',
          300: '#94bcdb',
          400: '#5f99c7',
          500: '#3c7db3',
          600: '#2b6294',
          700: '#224e77',
          800: '#1e4364',
          900: '#0f294a',
          950: '#09192e',
        },
        official: {
          green: '#059669',
          amber: '#d97706',
          blue: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
