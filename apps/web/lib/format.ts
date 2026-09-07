const RTF_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function relativeTime(iso: string): string {
  const diffSec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diffSec < 60) return "az önce";
  for (const [unit, secs] of RTF_UNITS) {
    if (diffSec >= secs) {
      const n = Math.floor(diffSec / secs);
      const map: Record<string, [string, string]> = {
        year: ["yıl", "yıl"],
        month: ["ay", "ay"],
        day: ["gün", "gün"],
        hour: ["saat", "saat"],
        minute: ["dakika", "dakika"],
      };
      return `${n} ${map[unit][0]} önce`;
    }
  }
  return "az önce";
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
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
  Models: "Modeller",
  Companies: "Şirketler",
  Research: "Araştırma",
  Robotics: "Robotik",
  Agents: "Yapay Zekâ Ajanları",
  AICoding: "Yazılım & Kodlama",
  GenerativeAI: "Üretken Yapay Zekâ",
  ComputerVision: "Bilgisayarlı Görü",
  VoiceAI: "Ses Yapay Zekâsı",
  HealthcareAI: "Sağlıkta Yapay Zekâ",
  FinanceAI: "Finansta Yapay Zekâ",
  OpenSource: "Açık Kaynak",
  AISafety: "Yapay Zekâ Güvenliği",
  Regulation: "Regülasyon",
  Infrastructure: "Altyapı",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABEL[c] ?? c;
}

export const IMPACT_LABEL: Record<string, string> = {
  low: "düşük etki",
  medium: "orta etki",
  high: "yüksek etki",
  critical: "kritik",
};
