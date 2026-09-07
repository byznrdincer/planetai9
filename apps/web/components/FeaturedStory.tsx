import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { EventCard as EventCardT } from "@/lib/types";
import { CategoryTag } from "./badges";
import { Cover } from "./Cover";

export function FeaturedStory({ event }: { event: EventCardT }) {
  return (
    <article className="group">
      <Link href={`/news/${event.slug}`} className="block">
        <Cover
          src={event.image_url}
          category={event.category}
          className="aspect-[16/9]"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <div className="mt-4">
          <CategoryTag category={event.category} />
          <h2 className="mt-2 headline text-3xl leading-[1.08] group-hover:text-brand-ink sm:text-4xl">
            {event.title}
          </h2>
          {event.summary && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{event.summary}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {event.top_source && (
              <span className="font-semibold text-ink-2">{event.top_source.name}</span>
            )}
            <span>·</span>
            <span>{relativeTime(event.published_at)}</span>
            {event.source_count > 1 && (
              <>
                <span>·</span>
                <span>{event.source_count} kaynak işledi</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
