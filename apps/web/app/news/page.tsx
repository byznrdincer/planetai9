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

  const qs = new URLSearchParams({ limit: "48", sort });
  if (category !== "All") qs.set("category", category);
  const page = await apiSafe<PageT>(`/events?${qs}`, { data: [], next_cursor: null, count: 0 });

  return (
    <Page title={category === "All" ? "Gündem" : categoryLabel(category)}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/news?category=${c}&sort=${sort}`}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                category === c ? "bg-accent text-white" : "bg-wash text-ink-2 hover:bg-line"
              }`}
            >
              {c === "All" ? "Tümü" : categoryLabel(c)}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 text-[11px] font-semibold">
          {(["recent", "importance"] as const).map((s) => (
            <Link
              key={s}
              href={`/news?category=${category}&sort=${s}`}
              className={`rounded-full px-2.5 py-1 ${sort === s ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {s === "recent" ? "En yeni" : "Önem sırası"}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {page.data.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
      {page.data.length === 0 && <p className="text-sm text-muted">Bu kategoride henüz haber yok.</p>}
    </Page>
  );
}
