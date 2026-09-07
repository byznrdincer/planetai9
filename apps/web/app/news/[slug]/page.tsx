import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard, EventRow } from "@/components/EventCard";
import { VideoCard } from "@/components/VideoCard";
import { CategoryTag, ImpactBadge } from "@/components/badges";
import { Cover } from "@/components/Cover";
import { api } from "@/lib/api";
import { dateLabel, relativeTime } from "@/lib/format";
import type { EventDetail, ImportanceFactors } from "@/lib/types";

export const revalidate = 120;

const FACTOR_LABEL: Record<keyof Omit<ImportanceFactors, "total">, string> = {
  source_reliability: "Kaynak güvenilirliği",
  independent_sources: "Bağımsız kaynak sayısı",
  entity_impact: "Aktör etkisi",
  novelty: "Yenilik",
  market_impact: "Pazar etkisi",
  velocity: "Yayılma hızı",
};

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let event: EventDetail;
  try {
    event = await api<EventDetail>(`/events/${slug}`, { revalidate: 120 });
  } catch {
    notFound();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <article className="mx-auto w-full max-w-2xl space-y-7">
        <div>
          <CategoryTag category={event.category} />
          <h1 className="mt-2 headline text-3xl leading-[1.1] sm:text-[2.6rem]">{event.title}</h1>
          {event.summary && (
            <p className="mt-4 text-lg leading-relaxed text-ink-2">{event.summary}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-2.5 text-xs text-muted">
            <ImpactBadge impact={event.impact} />
            <span>·</span>
            <span>{dateLabel(event.last_activity_at)}</span>
            <span>·</span>
            <span>{event.source_count} kaynak işledi</span>
          </div>
        </div>

        {event.image_url && (
          <Cover src={event.image_url} category={event.category} className="aspect-[16/9] rounded" />
        )}

        {event.why_it_matters && (
          <div className="border-l-[3px] border-brand bg-wash px-4 py-3">
            <p className="kicker mb-1">Neden önemli?</p>
            <p className="text-sm leading-relaxed text-ink-2">{event.why_it_matters}</p>
          </div>
        )}

        <section>
          <p className="eyebrow mb-3">Bu haberi işleyen kaynaklar</p>
          <div className="divide-y divide-line border-y border-line">
            {event.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 text-sm hover:text-brand-ink"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{s.title}</div>
                  <div className="text-[11px] text-muted">
                    {s.source.name} · {relativeTime(s.published_at)}
                  </div>
                </div>
                {s.is_primary && <span className="chip bg-brand/10 text-brand">Birincil kaynak</span>}
                <span className="text-muted">↗</span>
              </a>
            ))}
          </div>
        </section>

        {event.importance_factors && (
          <section>
            <p className="eyebrow mb-3">
              Önem puanı · {event.importance_factors.total.toFixed(1)}/10
            </p>
            <div className="space-y-2">
              {(Object.keys(FACTOR_LABEL) as (keyof typeof FACTOR_LABEL)[]).map((k) => (
                <div key={k} className="flex items-center gap-3 text-[11px]">
                  <span className="w-40 text-muted">{FACTOR_LABEL[k]}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
                    <div
                      className="h-full rounded-full bg-ink"
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
                href={`/search?q=${encodeURIComponent(entity.name)}`}
                className={`chip ${role === "primary" ? "bg-ink text-paper" : ""}`}
              >
                {entity.name}
              </Link>
            ))}
            {event.topics.map((t) => (
              <Link key={t.slug} href={`/trends/${t.slug}`} className="chip">
                #{t.name}
              </Link>
            ))}
          </section>
        )}

        {event.related_videos.length > 0 && (
          <section>
            <p className="eyebrow mb-3">İlgili PlanetAI videoları</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {event.related_videos.map((v) => (
                <VideoCard key={v.youtube_id} video={v} />
              ))}
            </div>
          </section>
        )}
      </article>

      <aside>
        {event.related_events.length > 0 && (
          <>
            <div className="section-head">
              <h2 className="headline text-lg">İlgili Haberler</h2>
            </div>
            <div className="divide-y divide-line">
              {event.related_events.map((e) => (
                <EventRow key={e.slug} event={e} />
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
