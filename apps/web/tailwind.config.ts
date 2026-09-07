import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        canvas: "#F5F6F8",
        wash: "#F0F1F4",
        ink: "#0F172A",
        "ink-2": "#475569",
        muted: "#8A94A6",
        line: "#E7E9EE",
        accent: "#2563EB",
        "accent-ink": "#1D4ED8",
        live: "#E0322A",
        "cat-models": "#7C3AED",
        "cat-companies": "#0EA5A0",
        "cat-research": "#6366F1",
        "cat-agents": "#2563EB",
        "cat-coding": "#0D9488",
        "cat-robotics": "#EA580C",
        "cat-safety": "#CA8A04",
        "cat-regulation": "#B91C1C",
        "cat-infra": "#475569",
        "cat-generative": "#DB2777",
        "cat-opensource": "#16A34A",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.03em" },
      maxWidth: { content: "1320px" },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 12px rgba(15,23,42,0.04)",
        pop: "0 8px 30px rgba(15,23,42,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
