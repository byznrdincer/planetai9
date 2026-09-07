import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { EventCard as EventCardT } from "@/lib/types";
import { CatBadge, Cover } from "./Cover";

export function EventCard({
  event,
  size = "md",
  locale = "tr",
}: {
  event: EventCardT;
  size?: "md" | "lg";
  locale?: Locale;
}) {
  const kaynak = locale === "tr" ? "kaynak" : "sources";
  return (
    <article className="group">
      <Link href={`/news/${event.slug}`} className="block">
        <div className="relative">
          <Cover
            src={event.image_url}
            category={event.category}
            className={size === "lg" ? "aspect-[16/9]" : "aspect-[3/2]"}
          />
          <span className="absolute left-2 top-2">
            <CatBadge category={event.category} locale={locale} />
          </span>
        </div>
        <h3
          className={`headline mt-3 leading-tight group-hover:text-accent ${
            size === "lg" ? "text-2xl" : "text-[17px]"
          }`}
        >
          {event.title}
        </h3>
        {event.summary && (
          <p className={`mt-2 text-ink-2 ${size === "lg" ? "line-clamp-3 text-[15px]" : "line-clamp-2 text-[13px]"}`}>
            {event.summary}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
          <span className="font-semibold text-ink-2">{event.top_source?.name}</span>
          <span>·</span>
          <span>{relativeTime(event.published_at, locale)}</span>
          {event.source_count > 1 && (
            <>
              <span>·</span>
              <span>
                {event.source_count} {kaynak}
              </span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}

export function EventRow({
  event,
  index,
  locale = "tr",
}: {
  event: EventCardT;
  index?: number;
  locale?: Locale;
}) {
  return (
    <Link href={`/news/${event.slug}`} className="group flex gap-3 border-b border-line py-3 last:border-b-0">
      {typeof index === "number" && (
        <span className="w-5 shrink-0 pt-0.5 text-lg font-black text-line">{index + 1}</span>
      )}
      {typeof index !== "number" && (
        <Cover src={event.image_url} category={event.category} className="h-16 w-20 shrink-0" />
      )}
      <div className="min-w-0">
        <h4 className="headline line-clamp-3 text-[13px] leading-snug group-hover:text-accent">
          {event.title}
        </h4>
        <div className="mt-1 text-[11px] text-muted">
          {event.top_source?.name} · {relativeTime(event.published_at, locale)}
        </div>
      </div>
    </Link>
  );
}
