// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(-5px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
        animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'spin-slow': 'spin 0.5s linear',
      },
      colors: {
        primary: "#8F87F1",
        secondary: "#C68EFD",
        accent: "#E9A5F1",
        softpink: "#FED2E2",
      },
    },
  },
  plugins: [],
}
