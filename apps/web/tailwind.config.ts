import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070B14",
        surface: "#0D1420",
        "surface-2": "#141E30",
        line: "#212C42",
        ink: "#EAEEF7",
        "ink-2": "#AEB9CE",
        muted: "#7A87A0",
        accent: "#5B8CFF",
        "accent-2": "#9C6BFF",
        lime: "#C9F24E",
        sage: "#8FA96B",
        pos: "#3FCF8E",
        neg: "#FF6B6B",
        "impact-low": "#7A87A0",
        "impact-medium": "#5B8CFF",
        "impact-high": "#FFB020",
        "impact-critical": "#FF6B6B",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.04em" },
      maxWidth: { content: "1200px" },
    },
  },
  plugins: [],
};

export default config;
