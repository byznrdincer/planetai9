import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { EventCard as EventCardT } from "@/lib/types";
import { CategoryTag } from "./badges";
import { Cover } from "./Cover";

export function EventCard({ event }: { event: EventCardT }) {
  return (
    <article className="group">
      <Link href={`/news/${event.slug}`} className="block">
        <Cover src={event.image_url} category={event.category} className="aspect-[16/10]" />
        <div className="mt-3">
          <CategoryTag category={event.category} />
          <h3 className="mt-1.5 headline text-lg leading-snug group-hover:text-brand-ink">
            {event.title}
          </h3>
          {event.summary && (
            <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{event.summary}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
            {event.top_source && <span className="font-semibold text-ink-2">{event.top_source.name}</span>}
            <span>·</span>
            <span>{relativeTime(event.published_at)}</span>
            {event.source_count > 1 && (
              <>
                <span>·</span>
                <span>{event.source_count} kaynak</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function EventRow({ event, index }: { event: EventCardT; index?: number }) {
  return (
    <Link href={`/news/${event.slug}`} className="group flex gap-3 py-3">
      {typeof index === "number" && (
        <span className="w-5 shrink-0 text-lg font-black text-line">{index + 1}</span>
      )}
      <Cover
        src={event.image_url}
        category={event.category}
        className="h-16 w-24 shrink-0 rounded"
      />
      <div className="min-w-0">
        <h4 className="headline line-clamp-3 text-sm leading-snug group-hover:text-brand-ink">
          {event.title}
        </h4>
        <div className="mt-1 text-[11px] text-muted">
          {event.top_source?.name} · {relativeTime(event.published_at)}
        </div>
      </div>
    </Link>
  );
}
