import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { bucketLabel, getDict, getLocale } from "@/lib/i18n";
import type { Page as PageT } from "@/lib/types";

export const revalidate = 60;

const BUCKETS = ["", "AI", "Robotics", "Coding", "Security", "Regulation", "Research", "Infra", "OpenSource"];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string; category?: string; sort?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDict();
  const sp = await searchParams;
  const bucket = sp.bucket ?? "";
  const sort = sp.sort === "importance" ? "importance" : "recent";

  const qs = new URLSearchParams({ limit: "48", sort });
  if (bucket) qs.set("bucket", bucket);
  else if (sp.category) qs.set("category", sp.category);
  const page = await apiSafe<PageT>(`/events?${qs}`, { data: [], next_cursor: null, count: 0 });

  const title = bucket ? bucketLabel(bucket, locale) : t.nav.news;

  return (
    <Page title={title}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {BUCKETS.map((b) => (
            <Link
              key={b || "all"}
              href={b ? `/news?bucket=${b}&sort=${sort}` : `/news?sort=${sort}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                bucket === b
                  ? "bg-ink text-white dark:bg-white dark:text-ink"
                  : "bg-wash text-ink-2 hover:bg-line dark:bg-d-wash dark:text-d-ink-2"
              }`}
            >
              {b ? bucketLabel(b, locale) : t.common.all}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 text-[12px] font-medium">
          {(["recent", "importance"] as const).map((s) => (
            <Link
              key={s}
              href={`/news?${bucket ? `bucket=${bucket}&` : ""}sort=${s}`}
              className={`rounded-full px-3 py-1.5 ${
                sort === s ? "bg-accent-soft text-accent dark:bg-accent/15" : "text-ink-2 hover:text-ink dark:text-d-ink-2"
              }`}
            >
              {s === "recent" ? t.common.latestSort : t.common.importanceSort}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {page.data.map((e) => (
          <EventCard key={e.slug} event={e} locale={locale} />
        ))}
      </div>
      {page.data.length === 0 && <p className="text-sm text-ink-2">{t.common.noNews}</p>}
    </Page>
  );
}
