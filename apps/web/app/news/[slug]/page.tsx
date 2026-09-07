import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRow } from "@/components/EventCard";
import { VideoCard } from "@/components/VideoCard";
import { CatBadge, Cover } from "@/components/Cover";
import { ImpactBadge } from "@/components/badges";
import { api } from "@/lib/api";
import { dateLabel, relativeTime } from "@/lib/format";
import { getDict, getLocale } from "@/lib/i18n";
import type { EventDetail, ImportanceFactors } from "@/lib/types";

export const revalidate = 120;

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getDict();
  let event: EventDetail;
  try {
    event = await api<EventDetail>(`/events/${slug}`, { revalidate: 120 });
  } catch {
    notFound();
  }

  const factorKeys = Object.keys(t.event.factors) as (keyof Omit<ImportanceFactors, "total">)[];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <article className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <CatBadge category={event.category} locale={locale} />
          <h1 className="mt-3 text-[2rem] font-black leading-[1.12] tracking-tight text-ink sm:text-[2.5rem]">
            {event.title}
          </h1>
          {event.summary && <p className="mt-4 text-lg leading-relaxed text-ink-2">{event.summary}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-2.5 text-xs text-muted">
            <ImpactBadge impact={event.impact} locale={locale} />
            <span>·</span>
            <span>{dateLabel(event.last_activity_at, locale)}</span>
            <span>·</span>
            <span>{t.event.coveredBy(event.source_count)}</span>
          </div>
        </div>

        {event.image_url && (
          <Cover src={event.image_url} category={event.category} className="aspect-[16/9]" rounded="rounded-xl" />
        )}

        {event.why_it_matters && (
          <div className="rounded-xl border-l-4 border-accent bg-paper p-4 shadow-sm">
            <p className="kicker mb-1">{t.event.whyMatters}</p>
            <p className="text-sm leading-relaxed text-ink-2">{event.why_it_matters}</p>
          </div>
        )}

        <section className="card p-4">
          <p className="eyebrow mb-3">{t.event.coveredBy(event.sources.length)}</p>
          <div className="divide-y divide-line">
            {event.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2.5 text-sm hover:text-accent"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{s.title}</div>
                  <div className="text-[11px] text-muted">
                    {s.source.name} · {relativeTime(s.published_at, locale)}
                  </div>
                </div>
                {s.is_primary && (
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                    {t.event.primary}
                  </span>
                )}
                <span className="text-muted">↗</span>
              </a>
            ))}
          </div>
        </section>

        {event.importance_factors && (
          <section className="card p-4">
            <p className="eyebrow mb-3">
              {t.event.score} · {event.importance_factors.total.toFixed(1)}/10
            </p>
            <div className="space-y-2">
              {factorKeys.map((k) => (
                <div key={k} className="flex items-center gap-3 text-[11px]">
                  <span className="w-40 text-muted">{t.event.factors[k]}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round(event.importance_factors![k] * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-muted">
                    {event.importance_factors![k].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(event.entities.length > 0 || event.topics.length > 0) && (
          <section className="flex flex-wrap gap-2">
            {event.entities.map(({ entity, role }) => (
              <Link
                key={entity.slug}
                href={`/entities/${entity.slug}`}
                className={role === "primary" ? "pill bg-accent text-white hover:bg-accent-ink" : "pill"}
              >
                {entity.name}
              </Link>
            ))}
            {event.topics.map((tp) => (
              <Link key={tp.slug} href={`/trends/${tp.slug}`} className="pill">
                #{tp.name.replace(/\s+/g, "")}
              </Link>
            ))}
          </section>
        )}

        {event.related_videos.length > 0 && (
          <section>
            <p className="eyebrow mb-3">{t.event.relatedVideos}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {event.related_videos.map((v) => (
                <VideoCard key={v.youtube_id} video={v} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </article>

      <aside>
        {event.related_events.length > 0 && (
          <div className="card p-4">
            <h2 className="mb-2 text-[15px] font-black tracking-tight text-ink">{t.section.related}</h2>
            <div className="divide-y divide-line">
              {event.related_events.map((e) => (
                <EventRow key={e.slug} event={e} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
