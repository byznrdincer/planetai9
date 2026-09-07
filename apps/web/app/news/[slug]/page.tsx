import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { VideoCard } from "@/components/VideoCard";
import { CategoryChip, ImpactBadge, ImportanceDot } from "@/components/badges";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import type { EventDetail, ImportanceFactors } from "@/lib/types";

export const revalidate = 120;

const FACTOR_LABEL: Record<keyof Omit<ImportanceFactors, "total">, string> = {
  source_reliability: "Source reliability",
  independent_sources: "Independent sources",
  entity_impact: "Entity impact",
  novelty: "Novelty",
  market_impact: "Market impact",
  velocity: "Velocity",
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
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryChip category={event.category} />
          <ImpactBadge impact={event.impact} />
          <ImportanceDot score={event.importance} />
          <span className="text-xs text-text-dim">{relativeTime(event.last_activity_at)}</span>
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">{event.title}</h1>
        {event.summary && <p className="mt-3 text-lg text-text-dim">{event.summary}</p>}
      </div>

      {event.why_it_matters && (
        <div className="card border-accent/30 bg-accent/5 p-5">
          <h2 className="section-title mb-2 text-accent">Why it matters</h2>
          <p className="text-sm leading-relaxed">{event.why_it_matters}</p>
        </div>
      )}

      <section>
        <h2 className="section-title mb-3">
          Covered by {event.sources.length} source{event.sources.length === 1 ? "" : "s"}
        </h2>
        <div className="card divide-y divide-border">
          {event.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 text-sm hover:bg-surface-2"
            >
              <div className="flex-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-text-dim">
                  {s.source.name} · {relativeTime(s.published_at)}
                </div>
              </div>
              {s.is_primary && (
                <span className="chip border-accent/40 text-accent">Primary source</span>
              )}
              <span className="text-text-dim">↗</span>
            </a>
          ))}
        </div>
      </section>

      {event.importance_factors && (
        <section>
          <h2 className="section-title mb-3">
            Why this score · {event.importance_factors.total.toFixed(1)}/10
          </h2>
          <div className="card space-y-2 p-4">
            {(
              Object.keys(FACTOR_LABEL) as (keyof typeof FACTOR_LABEL)[]
            ).map((k) => (
              <div key={k} className="flex items-center gap-3 text-xs">
                <span className="w-36 text-text-dim">{FACTOR_LABEL[k]}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round(event.importance_factors![k] * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-text-dim">
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
              className={`chip ${role === "primary" ? "border-accent/40 text-accent" : ""}`}
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
          <h2 className="section-title mb-3">Related PlanetAI videos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {event.related_videos.map((v) => (
              <VideoCard key={v.youtube_id} video={v} />
            ))}
          </div>
        </section>
      )}

      {event.related_events.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Related</h2>
          <div className="grid gap-3">
            {event.related_events.map((e) => (
              <EventCard key={e.slug} event={e} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
