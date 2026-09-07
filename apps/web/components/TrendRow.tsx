import Link from "next/link";
import type { TopicTrend } from "@/lib/types";

export function TrendRow({ trend }: { trend: TopicTrend }) {
  const up = trend.delta_pct >= 0;
  return (
    <Link
      href={`/trends/${trend.topic.slug}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2"
    >
      <span className="w-4 text-xs text-text-dim">{trend.rank}</span>
      <span className="flex-1 text-sm font-medium">#{trend.topic.name}</span>
      <span className="text-xs text-text-dim">{trend.event_count}</span>
      <span className={`w-14 text-right text-xs font-semibold ${up ? "text-pos" : "text-neg"}`}>
        {up ? "↑" : "↓"} {Math.abs(trend.delta_pct).toFixed(0)}%
      </span>
    </Link>
  );
}
