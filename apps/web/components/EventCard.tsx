import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { EventCard as EventCardT } from "@/lib/types";
import { CatBadge, Cover } from "./Cover";

export function EventCard({ event }: { event: EventCardT }) {
  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={`/news/${event.slug}`} className="flex h-full flex-col">
        <div className="relative">
          <Cover src={event.image_url} category={event.category} className="aspect-[16/10]" rounded="rounded-none" />
          <span className="absolute left-2 top-2">
            <CatBadge category={event.category} />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="headline line-clamp-3 text-[15px] leading-snug group-hover:text-accent">
            {event.title}
          </h3>
          {event.summary && (
            <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-2">{event.summary}</p>
          )}
          <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-muted">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-wash text-[9px] font-bold text-ink-2">
              {(event.top_source?.name ?? "?").slice(0, 1)}
            </span>
            <span className="font-semibold text-ink-2">{event.top_source?.name}</span>
            <span>·</span>
            <span>{relativeTime(event.published_at)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function EventRow({ event }: { event: EventCardT }) {
  return (
    <Link href={`/news/${event.slug}`} className="group flex gap-3 py-3">
      <Cover src={event.image_url} category={event.category} className="h-16 w-24 shrink-0" />
      <div className="min-w-0">
        <h4 className="headline line-clamp-3 text-[13px] leading-snug group-hover:text-accent">
          {event.title}
        </h4>
        <div className="mt-1 text-[11px] text-muted">
          {event.top_source?.name} · {relativeTime(event.published_at)}
        </div>
      </div>
    </Link>
  );
}
