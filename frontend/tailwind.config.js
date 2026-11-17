/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Institutional primary blue
        },
        esperanza: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669', // Hope emerald green
          700: '#047857',
        },
        alerta: {
          amarillo: '#f59e0b',
          naranja: '#ea580c',
          rojo: '#dc2626'
        }
      }
    },
  },
  plugins: [],
}
