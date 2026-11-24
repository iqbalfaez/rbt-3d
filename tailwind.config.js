/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bench: {
          950: '#0f1418',
          900: '#171f24',
          850: '#1e282f',
          800: '#26333c',
          700: '#374752',
          mat: '#1b4d3e',
          copper: '#d97736',
          brass: '#d4a644',
        },
      },
    },
  },
  plugins: [],
};
