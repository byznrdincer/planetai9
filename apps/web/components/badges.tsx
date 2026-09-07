import { impactLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

const IMPACT_DOT: Record<string, string> = {
  low: "bg-muted",
  medium: "bg-accent",
  high: "bg-cat-safety",
  critical: "bg-live",
};

export function ImpactBadge({ impact, locale = "tr" }: { impact: string; locale?: Locale }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-2">
      <span className={`h-1.5 w-1.5 rounded-full ${IMPACT_DOT[impact] ?? IMPACT_DOT.low}`} />
      {impactLabel(impact, locale)}
    </span>
  );
}
