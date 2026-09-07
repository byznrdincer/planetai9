import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { FeaturedLead } from "@/components/FeaturedLead";
import { ColumnsRail, MarketplaceRail, MostRead, TimelineRail, TrendPills } from "@/components/Rail";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { HomePayload, MarketplaceApp } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomePayload = {
  top_signals: [],
  latest_news: [],
  popular: [],
  trending: [],
  videos: [],
  timeline: [],
  columns: [],
};

function SectionRule({ title, href, seeAll }: { title: string; href?: string; seeAll: string }) {
  return (
    <div className="section-rule">
      <h2 className="text-lg font-black tracking-tight text-ink">{title}</h2>
      {href && (
        <Link href={href} className="text-[12px] font-semibold text-accent hover:text-accent-ink">
          {seeAll}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDict();
  const [raw, apps] = await Promise.all([
    apiSafe<HomePayload>("/home", EMPTY, { revalidate: 60, tags: ["home"] }),
    apiSafe<MarketplaceApp[]>("/marketplace", []),
  ]);
  const home: HomePayload = { ...EMPTY, ...raw };

  const pool = [
    ...home.top_signals,
    ...home.latest_news.filter((e) => !home.top_signals.some((s) => s.slug === e.slug)),
  ];
  const heroScore = (e: (typeof pool)[number]) =>
    (e.top_source?.source_type === "major_news" ? 4 : 0) +
    (e.image_url ? 3 : 0) +
    Math.min(e.source_count, 3) +
    e.importance / 10;
  const ranked = [...pool].sort((a, b) => heroScore(b) - heroScore(a));
  const lead = ranked[0];
  const side = ranked.slice(1, 4);
  const used = new Set([lead?.slug, ...side.map((e) => e.slug)]);
  const grid = home.latest_news.filter((e) => !used.has(e.slug)).slice(0, 10);

  return (
    <div className="space-y-10">
      {lead && <FeaturedLead lead={lead} side={side} locale={locale} />}

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <section>
            <SectionRule title={t.section.latest} href="/news" seeAll={t.common.seeAll} />
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {grid.map((e) => (
                <EventCard key={e.slug} event={e} locale={locale} />
              ))}
            </div>
            {grid.length === 0 && <p className="text-sm text-muted">{t.common.noNews}</p>}
          </section>

          {home.videos.length > 0 && (
            <section>
              <SectionRule title={t.section.video} href="/videos" seeAll={t.common.seeAll} />
              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {home.videos.slice(0, 3).map((v) => (
                  <VideoCard key={v.youtube_id} video={v} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {apps.length > 0 && (
            <section>
              <SectionRule
                title={t.section.marketplaceStrip}
                href="/marketplace"
                seeAll={t.common.seeAll}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {apps.slice(0, 4).map((a) => (
                  <a
                    key={a.slug}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group p-4 hover:border-accent/50"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded bg-wash text-sm font-black text-ink-2">
                      {a.name.slice(0, 1)}
                    </span>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-accent">
                      {a.category_label}
                    </p>
                    <p className="text-sm font-black text-ink group-hover:text-accent">{a.name}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] text-muted">{a.tagline}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-9">
          <MostRead events={home.popular.length ? home.popular : home.top_signals} t={t} />
          <TrendPills trends={home.trending} t={t} />
          <ColumnsRail columns={home.columns} t={t} />
          <MarketplaceRail apps={apps} t={t} />
          <TimelineRail items={home.timeline} t={t} locale={locale} />
        </aside>
      </div>
    </div>
  );
}
