import Link from "next/link";
import type { TopicTrend } from "@/lib/types";

export function TrendRow({ trend }: { trend: TopicTrend }) {
  const up = trend.delta_pct >= 0;
  return (
    <Link
      href={`/trends/${trend.topic.slug}`}
      className="flex items-center gap-3 border-t border-line px-1 py-2.5 first:border-t-0 hover:bg-surface-2/60"
    >
      <span className="w-4 text-xs font-semibold text-muted">{trend.rank}</span>
      <span className="flex-1 text-sm font-bold tracking-tight text-ink">#{trend.topic.name}</span>
      <span className="text-[11px] text-muted">{trend.event_count}</span>
      <span
        className={`w-12 text-right text-[11px] font-bold ${up ? "text-sage" : "text-impact-critical"}`}
      >
        {up ? "↑" : "↓"} {Math.abs(trend.delta_pct).toFixed(0)}%
      </span>
    </Link>
  );
}
