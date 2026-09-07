import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { EventCard as EventCardT } from "@/lib/types";
import { CategoryChip, ImpactBadge, ImportanceDot } from "./badges";

export function EventCard({ event, compact = false }: { event: EventCardT; compact?: boolean }) {
  return (
    <Link href={`/news/${event.slug}`} className="card card-hover group block">
      <div className="flex gap-4 p-4">
        {event.image_url && !compact && (
          <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryChip category={event.category} />
            <ImpactBadge impact={event.impact} />
            <ImportanceDot score={event.importance} />
            <span className="ml-auto text-[11px] text-muted">{relativeTime(event.published_at)}</span>
          </div>
          <h3 className="font-bold leading-snug tracking-tight text-ink group-hover:text-white">
            {event.title}
          </h3>
          {!compact && event.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-2">{event.summary}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            {event.primary_entity && (
              <span className="font-semibold text-accent">{event.primary_entity.name}</span>
            )}
            {event.top_source && <span>{event.top_source.name}</span>}
            {event.source_count > 1 && (
              <span className="chip">Covered by {event.source_count} sources</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
