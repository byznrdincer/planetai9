import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { TrendRow } from "@/components/TrendRow";
import { VideoCard } from "@/components/VideoCard";
import { CategoryChip, ImpactBadge, ImportanceDot } from "@/components/badges";
import { apiSafe } from "@/lib/api";
import { clockTime } from "@/lib/format";
import type { HomePayload } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomePayload = {
  top_signals: [],
  latest_news: [],
  trending: [],
  videos: [],
  timeline: [],
};

export default async function HomePage() {
  const home = await apiSafe<HomePayload>("/home", EMPTY, { revalidate: 60, tags: ["home"] });
  const [lead, ...rest] = home.top_signals;

  return (
    <div className="space-y-12">
      <section className="pt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Explore the AI Universe
        </h1>
        <p className="mt-2 text-text-dim">What&apos;s happening in AI right now?</p>
      </section>

      {lead && (
        <section>
          <h2 className="section-title mb-3">🔥 Top Signal</h2>
          <Link
            href={`/news/${lead.slug}`}
            className="card group block p-6 transition-colors hover:border-accent/50"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryChip category={lead.category} />
              <ImpactBadge impact={lead.impact} />
              <ImportanceDot score={lead.importance} />
            </div>
            <h3 className="text-2xl font-semibold leading-tight group-hover:text-white">
              {lead.title}
            </h3>
            {lead.summary && <p className="mt-2 max-w-2xl text-text-dim">{lead.summary}</p>}
            <div className="mt-4 flex flex-wrap gap-x-3 text-sm text-text-dim">
              {lead.primary_entity && <span className="text-accent">{lead.primary_entity.name}</span>}
              {lead.source_count > 1 && <span>Covered by {lead.source_count} sources</span>}
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((e) => (
                <EventCard key={e.slug} event={e} compact />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Latest AI News</h2>
            <Link href="/news" className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {home.latest_news.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
            {home.latest_news.length === 0 && (
              <p className="text-sm text-text-dim">No news yet — run the ingest pipeline.</p>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div>
            <h2 className="section-title mb-2">Trending</h2>
            <div className="card p-1">
              {home.trending.map((t) => (
                <TrendRow key={t.topic.slug} trend={t} />
              ))}
              {home.trending.length === 0 && (
                <p className="p-3 text-sm text-text-dim">No trend data yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="section-title mb-2">AI Timeline</h2>
            <div className="card divide-y divide-border">
              {home.timeline.slice(0, 12).map((t) => (
                <Link
                  key={t.slug}
                  href={`/news/${t.slug}`}
                  className="flex gap-3 p-3 text-sm hover:bg-surface-2"
                >
                  <span className="shrink-0 font-mono text-xs text-text-dim">
                    {clockTime(t.time)}
                  </span>
                  <span className="line-clamp-2">{t.title}</span>
                </Link>
              ))}
              {home.timeline.length === 0 && (
                <p className="p-3 text-sm text-text-dim">Quiet on the radar.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      {home.videos.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">PlanetAI Videos</h2>
            <Link href="/videos" className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.videos.slice(0, 4).map((v) => (
              <VideoCard key={v.youtube_id} video={v} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-3">Explore the AI Planet</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["News", "/news"],
            ["Trends", "/trends"],
            ["Videos", "/videos"],
            ["Sources", "/sources"],
            ["Search", "/search?q=ai"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="card p-4 text-center text-sm font-medium hover:border-accent/50"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
