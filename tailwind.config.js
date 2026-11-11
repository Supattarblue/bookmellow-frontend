
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        autumn: {
          cream: "#F8F3EA",
          beige: "#E8DCCB",
          sand: "#D2BDA5",
          copper: "#B87345",
          brown: "#795548",
          chestnut: "#5D4037",
          dark: "#35251F",
        },
      },
    },
  },
  plugins: [],
};
