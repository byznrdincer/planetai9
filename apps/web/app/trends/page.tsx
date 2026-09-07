import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { apiSafe } from "@/lib/api";
import type { TopicTrend } from "@/lib/types";

export const revalidate = 120;

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const win = (await searchParams).window === "7d" ? "7d" : "24h";
  const trends = await apiSafe<TopicTrend[]>(`/trends?window=${win}&limit=20`, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trending AI Topics</h1>
          <p className="mt-1 text-sm text-text-dim">
            Ranked by importance-weighted volume of events.
          </p>
        </div>
        <div className="flex gap-1 text-xs">
          {(["24h", "7d"] as const).map((w) => (
            <Link
              key={w}
              href={`/trends?window=${w}`}
              className={`rounded-md px-2.5 py-1 ${
                win === w ? "bg-surface-2 text-text" : "text-text-dim hover:text-text"
              }`}
            >
              {w}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {trends.map((t) => {
          const up = t.delta_pct >= 0;
          return (
            <div key={t.topic.slug} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-text-dim">{t.rank}</span>
                <Link
                  href={`/trends/${t.topic.slug}`}
                  className="text-lg font-semibold hover:text-white"
                >
                  #{t.topic.name}
                </Link>
                <span className={`text-sm font-semibold ${up ? "text-pos" : "text-neg"}`}>
                  {up ? "↑" : "↓"} {Math.abs(t.delta_pct).toFixed(0)}%
                </span>
                <span className="ml-auto text-xs text-text-dim">{t.event_count} events</span>
              </div>
              {t.sample_events.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {t.sample_events.map((e) => (
                    <EventCard key={e.slug} event={e} compact />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {trends.length === 0 && (
          <p className="text-sm text-text-dim">No trend snapshots yet.</p>
        )}
      </div>
    </div>
  );
}
