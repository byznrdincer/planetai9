import Link from "next/link";
import { EventCard, EventRow } from "@/components/EventCard";
import { FeaturedStory } from "@/components/FeaturedStory";
import { TrendRow } from "@/components/TrendRow";
import { VideoCard } from "@/components/VideoCard";
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

  const featurePool = home.top_signals.length ? home.top_signals : home.latest_news;
  const [feature, ...topRest] = featurePool;
  const secondary = topRest.slice(0, 4);
  const featuredSlugs = new Set([feature?.slug, ...secondary.map((e) => e.slug)]);
  const grid = home.latest_news.filter((e) => !featuredSlugs.has(e.slug));

  return (
    <div className="space-y-12">
      {/* manşet */}
      {feature && (
        <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.55fr_1fr]">
          <FeaturedStory event={feature} />
          <div className="divide-y divide-line lg:border-l lg:border-line lg:pl-8">
            {secondary.map((e) => (
              <EventRow key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* son haberler grid */}
        <div>
          <div className="section-head">
            <h2 className="headline text-xl">Son Haberler</h2>
            <Link href="/news" className="text-xs link-accent">
              Tümü →
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {grid.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
            {grid.length === 0 && (
              <p className="text-sm text-muted">Henüz haber yok.</p>
            )}
          </div>
        </div>

        {/* yan sütun */}
        <aside className="space-y-10">
          <div>
            <div className="section-head">
              <h2 className="headline text-xl">Öne Çıkan Konular</h2>
            </div>
            <div>
              {home.trending.map((t) => (
                <TrendRow key={t.topic.slug} trend={t} />
              ))}
              {home.trending.length === 0 && (
                <p className="py-3 text-sm text-muted">Trend verisi yok.</p>
              )}
            </div>
          </div>

          <div>
            <div className="section-head">
              <h2 className="headline text-xl">Zaman Çizelgesi</h2>
            </div>
            <div className="divide-y divide-line">
              {home.timeline.slice(0, 10).map((t) => (
                <Link key={t.slug} href={`/news/${t.slug}`} className="flex gap-3 py-2.5 text-sm hover:text-brand-ink">
                  <span className="shrink-0 font-mono text-[11px] text-muted">{clockTime(t.time)}</span>
                  <span className="line-clamp-2">{t.title}</span>
                </Link>
              ))}
              {home.timeline.length === 0 && (
                <p className="py-3 text-sm text-muted">Sakin bir gün.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      {home.videos.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="headline text-xl">PlanetAI Video</h2>
            <Link href="/videos" className="text-xs link-accent">
              Tümü →
            </Link>
          </div>
          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.videos.slice(0, 4).map((v) => (
              <VideoCard key={v.youtube_id} video={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
