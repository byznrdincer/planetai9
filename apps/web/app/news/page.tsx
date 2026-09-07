import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { categoryLabel } from "@/lib/format";
import type { Page as PageT } from "@/lib/types";

export const revalidate = 60;

const CATEGORIES = [
  "All",
  "Models",
  "Companies",
  "Agents",
  "AICoding",
  "Robotics",
  "GenerativeAI",
  "OpenSource",
  "AISafety",
  "Regulation",
  "Infrastructure",
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "All";
  const sort = sp.sort === "importance" ? "importance" : "recent";

  const qs = new URLSearchParams({ limit: "42", sort });
  if (category !== "All") qs.set("category", category);
  const page = await apiSafe<PageT>(`/events?${qs}`, { data: [], next_cursor: null, count: 0 });

  const title = category === "All" ? "Tüm Haberler" : categoryLabel(category);

  return (
    <Page title={title}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/news?category=${c}&sort=${sort}`}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                category === c ? "bg-ink text-paper" : "bg-wash text-ink-2 hover:text-brand-ink"
              }`}
            >
              {c === "All" ? "Tümü" : categoryLabel(c)}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 text-[11px] font-semibold uppercase tracking-wide">
          {(["recent", "importance"] as const).map((s) => (
            <Link
              key={s}
              href={`/news?category=${category}&sort=${s}`}
              className={`px-2 py-1 ${sort === s ? "text-ink underline underline-offset-4" : "text-muted"}`}
            >
              {s === "recent" ? "En yeni" : "Önem sırası"}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {page.data.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
      {page.data.length === 0 && (
        <p className="text-sm text-muted">Bu kategoride henüz haber yok.</p>
      )}
    </Page>
  );
}
