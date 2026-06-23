/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./frontend/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html"
  ],
  theme: {
    extend: {
      colors: {
        pm: {
          dark: '#0f172a',
          darker: '#020617',
          light: '#f8fafc',
          card: '#1e293b',
          accent: '#7c3aed',
        }
      }
    },
  },
  plugins: [],
}
