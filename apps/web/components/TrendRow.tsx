import Link from "next/link";
import type { TopicTrend } from "@/lib/types";

export function TrendRow({ trend }: { trend: TopicTrend }) {
  const up = trend.delta_pct >= 0;
  return (
    <Link
      href={`/trends/${trend.topic.slug}`}
      className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0 hover:text-brand-ink"
    >
      <span className="w-5 text-sm font-black text-line">{trend.rank}</span>
      <span className="flex-1 text-sm font-bold tracking-tight text-ink">#{trend.topic.name}</span>
      <span className="text-[11px] text-muted">{trend.event_count} haber</span>
      <span className={`w-12 text-right text-[11px] font-bold ${up ? "text-impact-medium" : "text-brand"}`}>
        {up ? "▲" : "▼"} {Math.abs(trend.delta_pct).toFixed(0)}%
      </span>
    </Link>
  );
}
