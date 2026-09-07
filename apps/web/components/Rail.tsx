import Link from "next/link";
import { clockTime } from "@/lib/format";
import type { DictT, Locale } from "@/lib/i18n";
import type { ColumnCardLite, EventCard, MarketplaceApp, TopicTrend } from "@/lib/types";

function Head({ title, href, seeAll }: { title: string; href?: string; seeAll: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between border-b-2 border-ink pb-1.5">
      <h3 className="text-[15px] font-black tracking-tight text-ink">{title}</h3>
      {href && (
        <Link href={href} className="text-[11px] font-semibold text-accent hover:text-accent-ink">
          {seeAll}
        </Link>
      )}
    </div>
  );
}

export function MostRead({ events, t }: { events: EventCard[]; t: DictT }) {
  return (
    <div>
      <Head title={t.section.mostRead} href="/news?sort=importance" seeAll={t.common.seeAll} />
      <ol>
        {events.map((e, i) => (
          <li key={e.slug}>
            <Link href={`/news/${e.slug}`} className="group flex gap-3 border-b border-line py-3 last:border-b-0">
              <span className="w-5 shrink-0 text-xl font-black text-accent">{i + 1}</span>
              <span className="headline text-[13px] leading-snug text-ink group-hover:text-accent">
                {e.title}
              </span>
            </Link>
          </li>
        ))}
        {events.length === 0 && <li className="py-3 text-[13px] text-muted">{t.common.noData}</li>}
      </ol>
    </div>
  );
}

export function TrendPills({ trends, t }: { trends: TopicTrend[]; t: DictT }) {
  return (
    <div>
      <Head title={t.section.trends} href="/trends" seeAll={t.common.seeAll} />
      <div className="flex flex-wrap gap-2 pt-1">
        {trends.map((tr) => (
          <Link key={tr.topic.slug} href={`/trends/${tr.topic.slug}`} className="pill">
            #{tr.topic.name.replace(/\s+/g, "")}
          </Link>
        ))}
        {trends.length === 0 && <span className="text-[13px] text-muted">{t.common.noData}</span>}
      </div>
    </div>
  );
}

export function ColumnsRail({ columns, t }: { columns: ColumnCardLite[]; t: DictT }) {
  return (
    <div>
      <Head title={t.section.fromAuthors} href="/yazarlar" seeAll={t.common.seeAll} />
      {columns.length === 0 ? (
        <p className="py-2 text-[13px] text-muted">{t.authors.soon}</p>
      ) : (
        <ul className="divide-y divide-line">
          {columns.map((c) => (
            <li key={c.slug}>
              <Link href={`/kose/${c.slug}`} className="group block py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {c.author_name}
                </p>
                <p className="headline mt-0.5 text-[14px] leading-snug group-hover:text-accent">
                  {c.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MarketplaceRail({ apps, t }: { apps: MarketplaceApp[]; t: DictT }) {
  return (
    <div>
      <Head title={t.marketplace.title} href="/marketplace" seeAll={t.common.seeAll} />
      <ul className="divide-y divide-line">
        {apps.slice(0, 5).map((a) => (
          <li key={a.slug}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-2.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-wash text-xs font-black text-ink-2">
                {a.name.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-ink group-hover:text-accent">
                  {a.name}
                </span>
                <span className="block truncate text-[11px] text-muted">{a.tagline}</span>
              </span>
            </a>
          </li>
        ))}
        {apps.length === 0 && <li className="py-2 text-[13px] text-muted">{t.common.noData}</li>}
      </ul>
      <Link
        href="/marketplace#oner"
        className="mt-3 block rounded-md border border-accent px-3 py-2 text-center text-[12px] font-bold text-accent hover:bg-accent hover:text-white"
      >
        {t.marketplace.suggest}
      </Link>
    </div>
  );
}

export function TimelineRail({
  items,
  t,
  locale,
}: {
  items: { slug: string; title: string; time: string }[];
  t: DictT;
  locale: Locale;
}) {
  return (
    <div>
      <Head title={t.section.breaking} href="/news" seeAll={t.common.seeAll} />
      <ul className="divide-y divide-line">
        {items.slice(0, 8).map((it) => (
          <li key={it.slug}>
            <Link href={`/news/${it.slug}`} className="group flex gap-2.5 py-2.5">
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {clockTime(it.time, locale)}
              </span>
              <span className="text-[13px] font-semibold leading-snug text-ink group-hover:text-accent">
                {it.title}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="py-2 text-[13px] text-muted">{t.common.quiet}</li>}
      </ul>
    </div>
  );
}
