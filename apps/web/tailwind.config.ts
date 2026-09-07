import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        wash: "#F6F5F2",
        ink: "#141414",
        "ink-2": "#3D3D3D",
        muted: "#767670",
        line: "#E6E4DD",
        brand: "#D42A20", // haber kırmızısı
        "brand-ink": "#A81E16",
        accent: "#1350C4",
        "impact-low": "#8A8A82",
        "impact-medium": "#1350C4",
        "impact-high": "#B26A00",
        "impact-critical": "#D42A20",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.035em" },
      maxWidth: { content: "1220px" },
    },
  },
  plugins: [],
};

export default config;
