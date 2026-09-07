import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Radar } from "@/components/Radar";
import { StatTile, compact } from "@/components/StatTile";
import { TrendRow } from "@/components/TrendRow";
import { VideoCard } from "@/components/VideoCard";
import { CategoryChip, ImpactBadge, ImportanceDot } from "@/components/badges";
import { apiSafe } from "@/lib/api";
import { clockTime } from "@/lib/format";
import type { HomePayload, Stats } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomePayload = {
  top_signals: [],
  latest_news: [],
  trending: [],
  videos: [],
  timeline: [],
};
const EMPTY_STATS: Stats = {
  entities: 0,
  companies: 0,
  models: 0,
  sources: 0,
  articles: 0,
  events: 0,
  topics: 0,
};

export default async function HomePage() {
  const [home, stats] = await Promise.all([
    apiSafe<HomePayload>("/home", EMPTY, { revalidate: 60, tags: ["home"] }),
    apiSafe<Stats>("/stats", EMPTY_STATS, { revalidate: 120 }),
  ]);
  const [lead, ...rest] = home.top_signals;

  return (
    <div>
      {/* hero */}
      <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow text-accent">AI Intelligence Platform</p>
          <h1 className="mt-4 text-[clamp(2.6rem,5.5vw,4.4rem)] font-black leading-[0.95] tracking-tightest text-ink">
            Yapay zekâ
            <br />
            dünyasının
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
              nabzını tut.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-ink-2">
            Haberleri, model duyurularını, araçları ve teknoloji değişimlerini tek merkezden,
            kaynaklarıyla birlikte takip et.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/news"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent/90"
            >
              Haberlere git →
            </Link>
            <Link
              href="/trends"
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent/60"
            >
              Trendler
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[360px]">
          <Radar centerValue={compact(stats.events)} centerLabel="İzlenen olay" />
        </div>
      </section>

      {/* stat tiles */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        <StatTile label="İzlenen Kaynak" value={compact(stats.sources)} hint="RSS · arXiv · YouTube" />
        <StatTile label="AI Entity" value={compact(stats.entities)} hint="şirket · model · araç" />
        <StatTile label="Toplanan Haber" value={compact(stats.articles)} hint="orijinal kaynaklı" />
        <StatTile label="Tespit Edilen Olay" value={compact(stats.events)} hint="dedup sonrası" />
      </section>

      {/* top signal */}
      {lead && (
        <section className="mt-14">
          <p className="eyebrow mb-3">🔥 Top Signal</p>
          <Link href={`/news/${lead.slug}`} className="card card-hover group block p-6 lg:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <CategoryChip category={lead.category} />
              <ImpactBadge impact={lead.impact} />
              <ImportanceDot score={lead.importance} />
            </div>
            <h2 className="max-w-3xl text-2xl font-black leading-tight tracking-tight text-ink group-hover:text-white lg:text-3xl">
              {lead.title}
            </h2>
            {lead.summary && <p className="mt-3 max-w-2xl text-ink-2">{lead.summary}</p>}
            <div className="mt-4 flex flex-wrap gap-x-4 text-[11px] uppercase tracking-wide text-muted">
              {lead.primary_entity && (
                <span className="font-semibold text-accent">{lead.primary_entity.name}</span>
              )}
              {lead.source_count > 1 && <span>Covered by {lead.source_count} sources</span>}
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((e) => (
                <EventCard key={e.slug} event={e} compact />
              ))}
            </div>
          )}
        </section>
      )}

      {/* latest + trending + timeline */}
      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="eyebrow">Son AI Haberleri</p>
            <Link href="/news" className="text-[11px] uppercase tracking-wide link-accent">
              Tümü →
            </Link>
          </div>
          <div className="space-y-3">
            {home.latest_news.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
            {home.latest_news.length === 0 && (
              <p className="text-sm text-muted">Henüz haber yok — ingest pipeline&apos;ı çalıştırın.</p>
            )}
          </div>
        </div>

        <aside className="space-y-10">
          <div>
            <p className="eyebrow mb-2">Trending</p>
            <div className="card px-3 py-1">
              {home.trending.map((t) => (
                <TrendRow key={t.topic.slug} trend={t} />
              ))}
              {home.trending.length === 0 && (
                <p className="px-1 py-3 text-sm text-muted">Trend verisi yok.</p>
              )}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">AI Timeline</p>
            <div className="card divide-y divide-line">
              {home.timeline.slice(0, 12).map((t) => (
                <Link
                  key={t.slug}
                  href={`/news/${t.slug}`}
                  className="flex gap-3 p-3 text-sm hover:bg-surface-2/60"
                >
                  <span className="shrink-0 font-mono text-[11px] text-muted">
                    {clockTime(t.time)}
                  </span>
                  <span className="line-clamp-2 text-ink-2">{t.title}</span>
                </Link>
              ))}
              {home.timeline.length === 0 && (
                <p className="p-3 text-sm text-muted">Radar sakin.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* videos */}
      {home.videos.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="eyebrow">PlanetAI Videos</p>
            <Link href="/videos" className="text-[11px] uppercase tracking-wide link-accent">
              Tümü →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.videos.slice(0, 4).map((v) => (
              <VideoCard key={v.youtube_id} video={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
