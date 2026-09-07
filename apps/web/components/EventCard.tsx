import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { EventCard as EventCardT } from "@/lib/types";
import { CategoryChip, ImpactBadge, ImportanceDot } from "./badges";

export function EventCard({ event, compact = false }: { event: EventCardT; compact?: boolean }) {
  return (
    <Link
      href={`/news/${event.slug}`}
      className="card group block p-4 transition-colors hover:border-accent/50"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CategoryChip category={event.category} />
        <ImpactBadge impact={event.impact} />
        <ImportanceDot score={event.importance} />
        <span className="ml-auto text-xs text-text-dim">{relativeTime(event.published_at)}</span>
      </div>
      <h3 className="font-semibold leading-snug text-text group-hover:text-white">
        {event.title}
      </h3>
      {!compact && event.summary && (
        <p className="mt-1.5 line-clamp-2 text-sm text-text-dim">{event.summary}</p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
        {event.primary_entity && (
          <span className="text-accent">{event.primary_entity.name}</span>
        )}
        {event.top_source && <span>{event.top_source.name}</span>}
        {event.source_count > 1 && (
          <span className="chip">Covered by {event.source_count} sources</span>
        )}
      </div>
    </Link>
  );
}
