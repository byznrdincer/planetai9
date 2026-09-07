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
    <Page title="Trendler" lead="Önem puanı ağırlıklı haber hacmine göre yükselen konular.">
      <div className="mb-6 flex gap-1 text-[12px] font-semibold">
        {(["24h", "7d"] as const).map((w) => (
          <Link
            key={w}
            href={`/trends?window=${w}`}
            className={`rounded-full px-3 py-1 ${win === w ? "bg-ink text-white" : "bg-wash text-muted hover:text-ink"}`}
          >
            {w === "24h" ? "Son 24 saat" : "Son 7 gün"}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {trends.map((t) => {
          const up = t.delta_pct >= 0;
          return (
            <div key={t.topic.slug} className="card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl font-black text-line">{t.rank}</span>
                <Link href={`/trends/${t.topic.slug}`} className="text-xl font-black tracking-tight text-ink hover:text-accent">
                  #{t.topic.name.replace(/\s+/g, "")}
                </Link>
                <span className={`text-sm font-bold ${up ? "text-accent" : "text-live"}`}>
                  {up ? "▲" : "▼"} {Math.abs(t.delta_pct).toFixed(0)}%
                </span>
                <span className="ml-auto text-[12px] text-muted">{t.event_count} haber</span>
              </div>
              {t.sample_events.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {t.sample_events.map((e) => (
                    <EventCard key={e.slug} event={e} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {trends.length === 0 && <p className="text-sm text-muted">Henüz trend verisi yok.</p>}
      </div>
    </Page>
  );
}
