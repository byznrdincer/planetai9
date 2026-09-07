import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { VideoCard } from "@/components/VideoCard";
import { CategoryChip, ImpactBadge, ImportanceDot } from "@/components/badges";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import type { EventDetail, ImportanceFactors } from "@/lib/types";

export const revalidate = 120;

const FACTOR_LABEL: Record<keyof Omit<ImportanceFactors, "total">, string> = {
  source_reliability: "Kaynak güvenilirliği",
  independent_sources: "Bağımsız kaynak",
  entity_impact: "Entity etkisi",
  novelty: "Yenilik",
  market_impact: "Pazar etkisi",
  velocity: "Hız",
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
    <Page section="Haber" title={event.category}>
      <article className="space-y-9">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <CategoryChip category={event.category} />
            <ImpactBadge impact={event.impact} />
            <ImportanceDot score={event.importance} />
            <span className="text-[11px] text-muted">{relativeTime(event.last_activity_at)}</span>
          </div>
          <h2 className="text-3xl font-black leading-[1.05] tracking-tight text-ink lg:text-4xl">
            {event.title}
          </h2>
          {event.summary && <p className="mt-4 text-lg text-ink-2">{event.summary}</p>}
        </div>

        {event.image_url && (
          <div className="overflow-hidden border border-line bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.image_url} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        )}

        {event.why_it_matters && (
          <div className="border-l-2 border-sage bg-surface-2/50 p-5">
            <p className="eyebrow mb-2 text-sage">Why it matters</p>
            <p className="text-sm leading-relaxed text-ink-2">{event.why_it_matters}</p>
          </div>
        )}

        <section>
          <p className="eyebrow mb-3">
            {event.sources.length} kaynak işledi
          </p>
          <div className="card divide-y divide-line">
            {event.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 text-sm hover:bg-surface-2/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{s.title}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted">
                    {s.source.name} · {relativeTime(s.published_at)}
                  </div>
                </div>
                {s.is_primary && (
                  <span className="chip border-sage/50 text-sage">Primary source</span>
                )}
                <span className="text-muted">↗</span>
              </a>
            ))}
          </div>
        </section>

        {event.importance_factors && (
          <section>
            <p className="eyebrow mb-3">
              Neden bu skor · {event.importance_factors.total.toFixed(1)}/10
            </p>
            <div className="card space-y-2.5 p-4">
              {(Object.keys(FACTOR_LABEL) as (keyof typeof FACTOR_LABEL)[]).map((k) => (
                <div key={k} className="flex items-center gap-3 text-[11px]">
                  <span className="w-36 uppercase tracking-wide text-muted">{FACTOR_LABEL[k]}</span>
                  <div className="h-1.5 flex-1 overflow-hidden bg-surface-2">
                    <div
                      className="h-full bg-sage"
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
                className={`chip ${role === "primary" ? "border-sage/50 text-sage" : ""}`}
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
            <div className="grid gap-4 sm:grid-cols-2">
              {event.related_videos.map((v) => (
                <VideoCard key={v.youtube_id} video={v} />
              ))}
            </div>
          </section>
        )}

        {event.related_events.length > 0 && (
          <section>
            <p className="eyebrow mb-3">İlgili</p>
            <div className="grid gap-3">
              {event.related_events.map((e) => (
                <EventCard key={e.slug} event={e} compact />
              ))}
            </div>
          </section>
        )}
      </article>
    </Page>
  );
}
