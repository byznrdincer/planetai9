import { categoryLabel, IMPACT_LABEL } from "@/lib/format";

export function CategoryTag({ category, className = "" }: { category: string; className?: string }) {
  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-[0.1em] text-brand ${className}`}
    >
      {categoryLabel(category)}
    </span>
  );
}

const IMPACT_DOT: Record<string, string> = {
  low: "bg-impact-low",
  medium: "bg-impact-medium",
  high: "bg-impact-high",
  critical: "bg-impact-critical",
};

export function ImpactBadge({ impact }: { impact: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${IMPACT_DOT[impact] ?? IMPACT_DOT.low}`} />
      {IMPACT_LABEL[impact] ?? impact}
    </span>
  );
}
