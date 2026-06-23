/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        kairo: {
          black: "#0f0f0f",
          dark: "#1a1a1a",
          sakura: "#ffb7c5",
          sakuraDeep: "#ff8fa3",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 183, 197, 0.35)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
