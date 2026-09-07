import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
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
    <Page section="Analiz" title="Trendler" wide>
      <div className="mb-6 flex items-end justify-between">
        <p className="max-w-md text-sm text-ink-2">
          Önem ağırlıklı olay hacmine göre sıralanır. Son {win} penceresi.
        </p>
        <div className="flex gap-1 text-[11px] uppercase tracking-wide">
          {(["24h", "7d"] as const).map((w) => (
            <Link
              key={w}
              href={`/trends?window=${w}`}
              className={`px-2.5 py-1 ${
                win === w ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:text-ink"
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
                <span className="text-lg font-black text-muted">{t.rank}</span>
                <Link
                  href={`/trends/${t.topic.slug}`}
                  className="text-lg font-black tracking-tight hover:text-sage"
                >
                  #{t.topic.name}
                </Link>
                <span
                  className={`text-sm font-bold ${up ? "text-sage" : "text-impact-critical"}`}
                >
                  {up ? "↑" : "↓"} {Math.abs(t.delta_pct).toFixed(0)}%
                </span>
                <span className="ml-auto text-[11px] uppercase tracking-wide text-muted">
                  {t.event_count} olay
                </span>
              </div>
              {t.sample_events.length > 0 && (
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {t.sample_events.map((e) => (
                    <EventCard key={e.slug} event={e} compact />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {trends.length === 0 && <p className="text-sm text-muted">Henüz trend snapshot yok.</p>}
      </div>
    </Page>
  );
}
