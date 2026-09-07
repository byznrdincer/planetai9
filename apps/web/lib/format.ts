export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function duration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  Models: "Models",
  Companies: "Companies",
  Research: "Research",
  Robotics: "Robotics",
  Agents: "AI Agents",
  AICoding: "AI Coding",
  GenerativeAI: "Generative AI",
  ComputerVision: "Computer Vision",
  VoiceAI: "Voice AI",
  HealthcareAI: "Healthcare AI",
  FinanceAI: "Finance AI",
  OpenSource: "Open Source",
  AISafety: "AI Safety",
  Regulation: "Regulation",
  Infrastructure: "Infrastructure",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABEL[c] ?? c;
}
