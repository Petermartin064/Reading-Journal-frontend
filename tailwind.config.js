/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F1EA',
        surface: '#FCFBF9',
        'surface-border': '#E6E2D6',
        'surface-hover': '#EAE7DF',
        primary: '#D46242', // Terracotta
        'primary-hover': '#BE5537',
        'text-primary': '#2B2B28', // Ink
        'text-muted': '#7C7A77',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
