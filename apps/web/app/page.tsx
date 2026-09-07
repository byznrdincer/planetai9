import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ModelStrip } from "@/components/ModelStrip";
import { GundemList, SonDakika, TrendPills } from "@/components/Rail";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import type { EntityListItem, HomePayload } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomePayload = {
  top_signals: [],
  latest_news: [],
  trending: [],
  videos: [],
  timeline: [],
};

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-ink">
        <span className="h-4 w-1 rounded bg-accent" />
        {title}
      </h2>
      <Link href={href} className="text-[12px] font-semibold text-accent hover:text-accent-ink">
        Tümünü gör →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [home, models] = await Promise.all([
    apiSafe<HomePayload>("/home", EMPTY, { revalidate: 60, tags: ["home"] }),
    apiSafe<EntityListItem[]>("/entities?type=model&limit=8", []),
  ]);

  const pool = [
    ...home.top_signals,
    ...home.latest_news.filter((e) => !home.top_signals.some((s) => s.slug === e.slug)),
  ];
  const heroScore = (e: (typeof pool)[number]) =>
    (e.top_source?.source_type === "major_news" ? 4 : 0) +
    Math.min(e.source_count, 3) +
    e.importance / 10;
  const heroSlides = pool
    .filter((e) => e.image_url)
    .sort((a, b) => heroScore(b) - heroScore(a))
    .slice(0, 4);
  const heroSlugs = new Set(heroSlides.map((e) => e.slug));
  const grid = home.latest_news.filter((e) => !heroSlugs.has(e.slug)).slice(0, 8);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-10">
        <HeroCarousel slides={heroSlides.length ? heroSlides : pool.slice(0, 4)} />

        <section>
          <SectionHead title="En Son Haberler" href="/news" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {grid.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
          {grid.length === 0 && <p className="text-sm text-muted">Henüz haber yok.</p>}
        </section>

        {models.length > 0 && (
          <section>
            <SectionHead title="Modeller" href="/models" />
            <ModelStrip models={models} />
          </section>
        )}

        {home.videos.length > 0 && (
          <section>
            <SectionHead title="PlanetAI Video" href="/videos" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {home.videos.slice(0, 3).map((v) => (
                <VideoCard key={v.youtube_id} video={v} />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-5">
        <SonDakika items={home.timeline} />
        <TrendPills trends={home.trending} />
        <GundemList events={home.top_signals.length ? home.top_signals : home.latest_news} />
      </aside>
    </div>
  );
}
