/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        frame: {
          bg: "#ffffff", // Stark White
          grid: "rgba(0, 0, 0, 0.05)", // Subtle black gridlines on white
          border: "rgba(0, 0, 0, 0.10)",
          card: "rgba(230, 230, 230, 0.5)", // Very subtle gray card (like sidebar)
          text: {
            primary: "#18181b", // near black
            secondary: "#a1a1aa", // muted zinc
          },
          accent: {
            indigo: "#6366f1", // Indigo (Used for button, and 'minutes')
            purple: "#a855f7", // Purple (Used for 'not hours')
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
