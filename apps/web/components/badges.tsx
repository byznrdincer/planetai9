import { IMPACT_LABEL } from "@/lib/format";

const IMPACT_DOT: Record<string, string> = {
  low: "bg-muted",
  medium: "bg-accent",
  high: "bg-cat-safety",
  critical: "bg-live",
};

export function ImpactBadge({ impact }: { impact: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-2">
      <span className={`h-1.5 w-1.5 rounded-full ${IMPACT_DOT[impact] ?? IMPACT_DOT.low}`} />
      {IMPACT_LABEL[impact] ?? impact}
    </span>
  );
}
