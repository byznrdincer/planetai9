import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070B14",
        surface: "#0E1524",
        "surface-2": "#16203A",
        border: "#243049",
        text: "#E8ECF5",
        "text-dim": "#93A0BC",
        accent: "#5B8CFF",
        "accent-2": "#9C6BFF",
        pos: "#3FCF8E",
        neg: "#FF6B6B",
        "impact-low": "#93A0BC",
        "impact-medium": "#5B8CFF",
        "impact-high": "#FFB020",
        "impact-critical": "#FF6B6B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "1200px" },
    },
  },
  plugins: [],
};

export default config;
