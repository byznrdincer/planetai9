import { categoryLabel } from "@/lib/format";

// deterministic wash color per category for the image-less fallback
const HUES: Record<string, string> = {
  Models: "#1350C4",
  Companies: "#0E7C66",
  Research: "#6A3FB0",
  Robotics: "#B2541C",
  Agents: "#1350C4",
  AICoding: "#0F766E",
  GenerativeAI: "#B03F8C",
  ComputerVision: "#2563A8",
  VoiceAI: "#7A4FB0",
  HealthcareAI: "#0E7C66",
  FinanceAI: "#0E7C4A",
  OpenSource: "#3F7A1C",
  AISafety: "#B26A00",
  Regulation: "#8A1F1A",
  Infrastructure: "#475569",
};

export function Cover({
  src,
  category,
  className = "",
  sizes = "(max-width: 768px) 100vw, 400px",
}: {
  src: string | null;
  category: string;
  className?: string;
  sizes?: string;
}) {
  const hue = HUES[category] ?? "#475569";
  return (
    <div className={`relative overflow-hidden bg-wash ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          sizes={sizes}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-end p-3"
          style={{ background: `linear-gradient(150deg, ${hue}, ${hue}22)` }}
        >
          <span className="text-xs font-black uppercase tracking-wide text-white/90">
            {categoryLabel(category)}
          </span>
        </div>
      )}
    </div>
  );
}
