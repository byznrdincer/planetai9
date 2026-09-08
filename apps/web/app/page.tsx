import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { EventCard, NewsListItem } from "@/components/EventCard";
import { HeroBlock } from "@/components/HeroBlock";
import { HomeSidebar } from "@/components/HomeRail";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { CategoryCount, HomePayload } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomePayload = {
  top_signals: [],
  latest_news: [],
  popular: [],
  trending: [],
  videos: [],
  timeline: [],
  columns: [],
  sections: {},
};

function SectionHead({ title, href, seeAll }: { title: string; href?: string; seeAll: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="sec-title">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[13px] font-semibold text-accent hover:text-accent-ink"
        >
          {seeAll} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getDict();
  const [raw, counts] = await Promise.all([
    apiSafe<HomePayload>("/home", EMPTY, { revalidate: 60, tags: ["home"] }),
    apiSafe<CategoryCount[]>("/categories", []),
  ]);
  const home: HomePayload = { ...EMPTY, ...raw };

  const pool = [
    ...home.top_signals,
    ...home.latest_news.filter((e) => !home.top_signals.some((s) => s.slug === e.slug)),
  ];
  const score = (e: (typeof pool)[number]) =>
    (e.top_source?.source_type === "major_news" ? 4 : 0) +
    (e.image_url ? 3 : 0) +
    Math.min(e.source_count, 3) +
    e.importance / 10;
  const ranked = [...pool].sort((a, b) => score(b) - score(a));

  const lead = ranked[0];
  const side = ranked.slice(1, 5);
  const featured = ranked.slice(5, 9);
  const used = new Set([lead?.slug, ...side.map((e) => e.slug), ...featured.map((e) => e.slug)]);
  const latest = home.latest_news.filter((e) => !used.has(e.slug)).slice(0, 6);

  return (
    <div className="space-y-16">
      {lead && (
        <HeroBlock lead={lead} side={side} locale={locale} readMore={locale === "tr" ? "Haberin devamı" : "Read more"} />
      )}

      {featured.length > 0 && (
        <section>
          <SectionHead
            title={locale === "tr" ? "Öne Çıkanlar" : "Featured"}
            href="/news?sort=importance"
            seeAll={locale === "tr" ? "Tümünü gör" : "See all"}
          />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((e) => (
              <EventCard key={e.slug} event={e} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div>
          <SectionHead
            title={t.section.latest}
            href="/news"
            seeAll={locale === "tr" ? "Tümünü gör" : "See all"}
          />
          <div>
            {latest.map((e) => (
              <NewsListItem key={e.slug} event={e} locale={locale} />
            ))}
            {latest.length === 0 && <p className="text-sm text-ink-2">{t.common.noNews}</p>}
          </div>
        </div>
        <HomeSidebar trends={home.trending} videos={home.videos} t={t} locale={locale} />
      </section>

      {home.videos.length > 0 && (
        <section>
          <SectionHead
            title={t.section.video}
            href="/videos"
            seeAll={locale === "tr" ? "Tümünü gör" : "See all"}
          />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {home.videos.slice(0, 4).map((v) => (
              <VideoCard key={v.youtube_id} video={v} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <CategoryGrid counts={counts} locale={locale} seeAll={locale === "tr" ? "Tümünü gör" : "See all"} />
    </div>
  );
}
