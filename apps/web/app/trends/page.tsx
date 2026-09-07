import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { TopicTrend } from "@/lib/types";

export const revalidate = 120;

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDict();
  const win = (await searchParams).window === "7d" ? "7d" : "24h";
  const trends = await apiSafe<TopicTrend[]>(`/trends?window=${win}&limit=20`, []);

  const winLabel = { "24h": locale === "tr" ? "Son 24 saat" : "Last 24h", "7d": locale === "tr" ? "Son 7 gün" : "Last 7d" };

  return (
    <Page
      title={t.section.trends}
      lead={
        locale === "tr"
          ? "Önem puanı ağırlıklı haber hacmine göre yükselen konular."
          : "Topics rising by importance-weighted news volume."
      }
    >
      <div className="mb-6 flex gap-1 text-[12px] font-semibold">
        {(["24h", "7d"] as const).map((w) => (
          <Link
            key={w}
            href={`/trends?window=${w}`}
            className={`rounded-full px-3 py-1 ${win === w ? "bg-ink text-white" : "bg-wash text-muted hover:text-ink"}`}
          >
            {winLabel[w]}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {trends.map((tr) => {
          const up = tr.delta_pct >= 0;
          return (
            <div key={tr.topic.slug} className="card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl font-black text-line">{tr.rank}</span>
                <Link
                  href={`/trends/${tr.topic.slug}`}
                  className="text-xl font-black tracking-tight text-ink hover:text-accent"
                >
                  #{tr.topic.name.replace(/\s+/g, "")}
                </Link>
                <span className={`text-sm font-bold ${up ? "text-accent" : "text-live"}`}>
                  {up ? "▲" : "▼"} {Math.abs(tr.delta_pct).toFixed(0)}%
                </span>
                <span className="ml-auto text-[12px] text-muted">
                  {tr.event_count} {locale === "tr" ? "haber" : "stories"}
                </span>
              </div>
              {tr.sample_events.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {tr.sample_events.map((e) => (
                    <EventCard key={e.slug} event={e} locale={locale} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {trends.length === 0 && <p className="text-sm text-muted">{t.common.noData}</p>}
      </div>
    </Page>
  );
}
