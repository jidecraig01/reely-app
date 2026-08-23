/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",
        velvet: "#161B2C",
        velvetLight: "#1F263C",
        velvetLighter: "#2A314A",
        gold: "#E8B54D",
        screen: "#F5F3EC",
        screenDim: "#9CA0B4",
        plum: "#8B6F9E",
        sage: "#7A9B76",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
