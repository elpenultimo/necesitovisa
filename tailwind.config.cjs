/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.04)",
      },
      colors: {
        brand: {
          primary: "#2563eb",
          dark: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};
