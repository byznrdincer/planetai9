import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSideItem } from "@/components/EventCard";
import { Meta } from "@/components/Meta";
import { CatBadge, Cover } from "@/components/Cover";
import type { Locale } from "@/lib/i18n";
import type { EventCard } from "@/lib/types";

export function HeroBlock({
  lead,
  side,
  locale,
  readMore,
}: {
  lead: EventCard;
  side: EventCard[];
  locale: Locale;
  readMore: string;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start lg:gap-10">
      <article className="group">
        <Link href={`/news/${lead.slug}`} className="block">
          <div className="relative">
            <Cover src={lead.image_url} category={lead.category} className="aspect-[16/9]" rounded="rounded-card" zoom />
            <span className="absolute left-4 top-4">
              <CatBadge category={lead.category} locale={locale} className="bg-white/95 shadow-soft" />
            </span>
          </div>
          <Meta
            summary={lead.summary}
            date={lead.published_at}
            source={lead.top_source?.name}
            locale={locale}
            className="mt-4"
          />
          <h1 className="mt-2 text-[28px] font-extrabold leading-[1.12] tracking-tight3 text-ink transition-colors group-hover:text-accent dark:text-d-ink sm:text-[34px]">
            {lead.title}
          </h1>
          {lead.summary && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2 dark:text-d-ink-2">
              {lead.summary}
            </p>
          )}
          <span className="btn-dark mt-5">
            {readMore} <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </article>

      <div className="card p-5 lg:p-6">
        {side.map((e) => (
          <HeroSideItem key={e.slug} event={e} locale={locale} />
        ))}
      </div>
    </section>
  );
}
