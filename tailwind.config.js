/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enable manual dark mode toggle
  theme: {
    extend: {
      animation: {
        "blob-slow": "blob 15s infinite ease-in-out",
        "pulse-slow": "pulse-slow 8s infinite ease-in-out",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.05", transform: "scale(1)" },
          "50%": { opacity: "0.1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
