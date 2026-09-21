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
        canvas: {
          DEFAULT: '#090a0f',
          surface: '#12141c',
          card: '#151822',
          subtle: '#1b1f2b',
          border: '#222736',
          sunken: '#0b0d13',
        },
        terminal: {
          950: '#090a0f',
          900: '#0e1118',
          850: '#131620',
          800: '#181c28',
          700: '#232838',
          600: '#323a4e',
          500: '#48536e',
          accent: '#38bdf8',
          accentMuted: '#0ea5e9',
          solana: '#14f195',
          solanaPurple: '#a78bfa',
          bnb: '#f59e0b',
          bull: '#10b981',
          bear: '#f43f5e',
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
