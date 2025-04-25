/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kindkite: {
          bg: {
            light: '#f5ead7',
            dark: '#f8dfc3',
          },
          text: {
            primary: '#442e1c',
            secondary: '#5e4633',
          },
          button: {
            primary: '#3d6b44',
            secondary: '#d77e36',
          },
          bar: {
            fill: '#4d7c54',
            bg: '#f2e4d5',
          },
        },
      },
      backgroundImage: {
        'gradient-kindkite': 'linear-gradient(to bottom right, #f5ead7, #f8dfc3)',
      },
    },
  },
  plugins: [],
}
