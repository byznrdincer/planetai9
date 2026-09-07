import { categoryLabel } from "@/lib/format";

const IMPACT_STYLE: Record<string, string> = {
  low: "border-impact-low/40 text-impact-low",
  medium: "border-impact-medium/40 text-impact-medium",
  high: "border-impact-high/50 text-impact-high",
  critical: "border-impact-critical/50 text-impact-critical",
};

export function ImpactBadge({ impact }: { impact: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        IMPACT_STYLE[impact] ?? IMPACT_STYLE.low
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {impact}
    </span>
  );
}

export function ImportanceDot({ score }: { score: number }) {
  const color =
    score >= 9
      ? "bg-impact-critical"
      : score >= 7
        ? "bg-impact-high"
        : score >= 4
          ? "bg-impact-medium"
          : "bg-impact-low";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted"
      title={`Önem ${score.toFixed(1)}/10`}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {score.toFixed(1)}
    </span>
  );
}

export function CategoryChip({ category }: { category: string }) {
  return <span className="chip">{categoryLabel(category)}</span>;
}
