export const CATEGORY_COLOR: Record<string, string> = {
  Models: "#7C3AED",
  Companies: "#0EA5A0",
  Research: "#6366F1",
  Robotics: "#EA580C",
  Agents: "#2563EB",
  AICoding: "#0D9488",
  GenerativeAI: "#DB2777",
  ComputerVision: "#2563A8",
  VoiceAI: "#7A4FB0",
  HealthcareAI: "#0E7C66",
  FinanceAI: "#0E7C4A",
  OpenSource: "#16A34A",
  AISafety: "#CA8A04",
  Regulation: "#B91C1C",
  Infrastructure: "#475569",
};

export function catColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#475569";
}
