import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EventCard, NewsListItem } from "@/components/EventCard";
import { apiSafe } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import { KIND_LABEL, TR_ECOSYSTEM, TR_FACTS } from "@/lib/turkey";
import type { Page as PageT, VideoCard } from "@/lib/types";

export const revalidate = 300;

export default async function TurkiyePage() {
  const locale = await getLocale();
  const tr = locale === "tr";

  const [news, videos] = await Promise.all([
    apiSafe<PageT>("/events?topic=turkiye&limit=24&sort=recent", {
      data: [],
      next_cursor: null,
      count: 0,
    }),
    apiSafe<VideoCard[]>("/videos?limit=36", []),
  ]);

  const trVideos = videos.filter((v) => /t[üu]rk|t[üu]rkiye/i.test(v.title)).slice(0, 4);
  const [lead, ...rest] = news.data;

  return (
    <div className="space-y-14">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          {tr ? "Ekosistem Raporu" : "Ecosystem Report"}
        </p>
        <h1 className="mt-2 text-[32px] font-extrabold tracking-tight3 text-ink dark:text-d-ink sm:text-[40px]">
          {tr ? "Türkiye'de Yapay Zekâ" : "AI in Türkiye"}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2 dark:text-d-ink-2">
          {tr
            ? "Türkiye'nin yapay zekâ ekosistemi son yıllarda ulusal strateji, Türkçe dil modelleri ve üniversite laboratuvarları etrafında hızla şekilleniyor. Bu sayfa; gündemi, kilit kurumları ve PlanetAI9'un Türkiye odaklı içeriklerini bir araya getirir."
            : "Türkiye's AI ecosystem is taking shape fast around a national strategy, Turkish language models and university labs. This page brings together the news, the key institutions and PlanetAI9's Türkiye-focused coverage."}
        </p>

        <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-d-line">
          {TR_FACTS.map((f) => (
            <div key={f.label.tr}>
              <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2 dark:text-d-ink-2">
                {f.label[locale]}
              </dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink dark:text-d-ink">
                {f.value[locale]}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Gündem */}
      <section className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
        <div>
          <h2 className="sec-title mb-6">{tr ? "Türkiye Gündemi" : "Türkiye News"}</h2>
          {news.data.length === 0 ? (
            <p className="text-sm text-ink-2 dark:text-d-ink-2">
              {tr
                ? "Türkiye etiketli haber henüz yok — kaynaklar tarandıkça burada görünecek."
                : "No Türkiye-tagged news yet."}
            </p>
          ) : (
            <>
              {lead && (
                <div className="mb-2">
                  <EventCard event={lead} locale={locale} />
                </div>
              )}
              <div>
                {rest.slice(0, 6).map((e) => (
                  <NewsListItem key={e.slug} event={e} locale={locale} />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-6">
          {trVideos.length > 0 && (
            <div className="card overflow-hidden">
              <h3 className="border-b border-line px-5 py-3 text-[15px] font-extrabold tracking-tight3 text-ink dark:border-d-line dark:text-d-ink">
                {tr ? "Türkiye Videoları" : "Türkiye Videos"}
              </h3>
              <ul className="divide-y divide-line dark:divide-d-line">
                {trVideos.map((v) => (
                  <li key={v.youtube_id}>
                    <Link href={`/videos/${v.youtube_id}`} className="group flex gap-3 p-4">
                      <span className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-wash dark:bg-d-wash">
                        {v.thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="line-clamp-3 text-[13px] font-bold leading-snug text-ink group-hover:text-accent dark:text-d-ink">
                        {v.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Ekosistem */}
      <section>
        <h2 className="sec-title mb-6">{tr ? "Ekosistem" : "The Ecosystem"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TR_ECOSYSTEM.map((o) => (
            <a
              key={o.name}
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover group p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
                  {KIND_LABEL[o.kind][locale]}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mt-1.5 text-[15px] font-bold tracking-tight2 text-ink group-hover:text-accent dark:text-d-ink">
                {o.name}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2 dark:text-d-ink-2">
                {o.note[locale]}
              </p>
            </a>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-muted">
          {tr
            ? "Liste PlanetAI9 editörlerince derlenmiştir; eksik ya da yanlış bir bilgi için Biz Kimiz sayfasından ulaşabilirsiniz."
            : "Curated by PlanetAI9 editors; reach us via the About page for corrections."}
        </p>
      </section>
    </div>
  );
}
