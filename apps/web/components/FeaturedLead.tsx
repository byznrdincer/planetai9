import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { EventCard } from "@/lib/types";
import { CatBadge, Cover } from "./Cover";

export function FeaturedLead({
  lead,
  side,
  locale,
}: {
  lead: EventCard;
  side: EventCard[];
  locale: Locale;
}) {
  return (
    <section className="grid gap-6 border-b-2 border-ink pb-8 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
      <article className="group">
        <Link href={`/news/${lead.slug}`} className="block">
          <div className="relative">
            <Cover src={lead.image_url} category={lead.category} className="aspect-[16/9]" />
            <span className="absolute left-3 top-3">
              <CatBadge category={lead.category} locale={locale} />
            </span>
          </div>
          <h2 className="headline mt-4 text-3xl leading-[1.08] group-hover:text-accent sm:text-[2.6rem]">
            {lead.title}
          </h2>
          {lead.summary && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{lead.summary}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="font-semibold text-ink-2">{lead.top_source?.name}</span>
            <span>·</span>
            <span>{relativeTime(lead.published_at, locale)}</span>
          </div>
        </Link>
      </article>

      <div className="divide-y divide-line lg:border-l lg:border-line lg:pl-8">
        {side.map((e) => (
          <Link key={e.slug} href={`/news/${e.slug}`} className="group flex gap-3 py-4 first:pt-0">
            <div className="min-w-0 flex-1">
              <h3 className="headline text-[15px] leading-snug group-hover:text-accent">{e.title}</h3>
              <div className="mt-1 text-[11px] text-muted">
                {e.top_source?.name} · {relativeTime(e.published_at, locale)}
              </div>
            </div>
            <Cover src={e.image_url} category={e.category} className="h-20 w-28 shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
