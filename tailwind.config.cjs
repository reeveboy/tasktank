/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark": "#0D253A",
        "starynight": "#0375B4",
        "neutral": "#EFEFEF",
        "carbon": "#A9A9A9",
        "sky-blue": "#CAEBF2"
      },
    },
  },
  plugins: [],
};

module.exports = config;
