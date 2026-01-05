import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0b5fff",
          dark: "#0a3e8c",
          accent: "#00c2a8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
