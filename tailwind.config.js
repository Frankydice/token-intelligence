/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          950: '#090d16',
          900: '#0d1322',
          850: '#11192d',
          800: '#17223b',
          700: '#223254',
          600: '#334773',
          500: '#4d68a3',
          accent: '#00f2fe',
          solana: '#14f195',
          solanaPurple: '#9945ff',
          bnb: '#f3ba2f',
          bull: '#10b981',
          bear: '#ef4444',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
