/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS, JSX, TS, and TSX files in the src folder
    "./public/index.html",      // Scan your main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}