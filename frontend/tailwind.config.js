/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(28, 82, 118)',
          50: 'rgba(28, 82, 118, 0.1)',
          100: 'rgba(28, 82, 118, 0.2)',
          200: 'rgba(28, 82, 118, 0.3)',
          300: 'rgba(28, 82, 118, 0.4)',
          400: 'rgba(28, 82, 118, 0.5)',
          500: 'rgba(28, 82, 118, 0.6)',
          600: 'rgba(28, 82, 118, 0.7)',
          700: 'rgba(28, 82, 118, 0.8)',
          800: 'rgba(28, 82, 118, 0.9)',
          900: 'rgba(18, 56, 80, 1)',
        }
      }
    },
  },
  plugins: [],
}

