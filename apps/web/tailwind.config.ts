import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        canvas: "#FAFAFA",
        wash: "#F4F4F5",
        line: "#E8E8E8",
        ink: "#111827",
        "ink-2": "#6B7280",
        muted: "#9CA3AF",
        accent: "#2563EB",
        "accent-ink": "#1D4ED8",
        "accent-soft": "#EFF4FF",
        live: "#DC2626",
        success: "#16A34A",
        // dark
        "d-paper": "#0B0B0C",
        "d-canvas": "#141416",
        "d-wash": "#1C1C1F",
        "d-line": "#2A2A2E",
        "d-ink": "#F5F5F6",
        "d-ink-2": "#A1A1AA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: { tight2: "-0.02em", tight3: "-0.03em" },
      maxWidth: { content: "1440px" },
      borderRadius: { card: "20px", "card-lg": "24px" },
      boxShadow: {
        soft: "0 1px 2px rgba(17,24,39,0.04), 0 1px 3px rgba(17,24,39,0.03)",
        raise: "0 12px 32px -12px rgba(17,24,39,0.14), 0 4px 12px -6px rgba(17,24,39,0.08)",
      },
      transitionDuration: { 250: "250ms" },
    },
  },
  plugins: [],
};

export default config;
