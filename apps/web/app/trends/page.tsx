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
      <div className="mb-6 flex gap-1 text-[11px] font-semibold uppercase tracking-wide">
        {(["24h", "7d"] as const).map((w) => (
          <Link
            key={w}
            href={`/trends?window=${w}`}
            className={`px-2 py-1 ${win === w ? "text-ink underline underline-offset-4" : "text-muted"}`}
          >
            {w === "24h" ? "Son 24 saat" : "Son 7 gün"}
          </Link>
        ))}
      </div>

      <div className="space-y-8">
        {trends.map((t) => {
          const up = t.delta_pct >= 0;
          return (
            <div key={t.topic.slug} className="border-b border-line pb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl font-black text-line">{t.rank}</span>
                <Link href={`/trends/${t.topic.slug}`} className="headline text-xl hover:text-brand-ink">
                  #{t.topic.name}
                </Link>
                <span className={`text-sm font-bold ${up ? "text-impact-medium" : "text-brand"}`}>
                  {up ? "▲" : "▼"} {Math.abs(t.delta_pct).toFixed(0)}%
                </span>
                <span className="ml-auto text-[11px] text-muted">{t.event_count} haber</span>
              </div>
              {t.sample_events.length > 0 && (
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-3">
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
