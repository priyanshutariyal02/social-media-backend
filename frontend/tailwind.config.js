/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateDark: "#0b0f19",
        cardDark: "#131a2a",
        borderDark: "#1f293d",
        accentCyan: "#00f2fe",
        accentPurple: "#4facfe",
      },
    },
  },
  plugins: [],
};
