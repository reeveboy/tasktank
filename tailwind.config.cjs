/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0D253A",
        starynight: "#0375B4",
        neutral: "#EFEFEF",
        carbon: "#A9A9A9",
        "sky-blue": "#CAEBF2",
        watermelon: "#F97A7C",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

module.exports = config;
