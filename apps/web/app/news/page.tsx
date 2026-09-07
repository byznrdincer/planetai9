import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { categoryLabel } from "@/lib/format";
import type { CategoryCount, Page as PageT } from "@/lib/types";

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

  const qs = new URLSearchParams({ limit: "40", sort });
  if (category !== "All") qs.set("category", category);

  const [page, counts] = await Promise.all([
    apiSafe<PageT>(`/events?${qs}`, { data: [], next_cursor: null, count: 0 }),
    apiSafe<CategoryCount[]>("/categories", []),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c.events_24h]));

  return (
    <Page section="Keşfet" title="Haberler" wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/news?category=${c}&sort=${sort}`}
              className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                category === c
                  ? "border-ink bg-ink text-bg"
                  : "border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {c === "All" ? "Tümü" : categoryLabel(c)}
              {c !== "All" && countMap[c] ? (
                <span className="ml-1 opacity-60">{countMap[c]}</span>
              ) : null}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 text-[11px] uppercase tracking-wide">
          {(["recent", "importance"] as const).map((s) => (
            <Link
              key={s}
              href={`/news?category=${category}&sort=${s}`}
              className={`px-2.5 py-1 ${
                sort === s ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {s === "recent" ? "Son" : "Önemli"}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {page.data.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
        {page.data.length === 0 && (
          <p className="text-sm text-muted">Bu kategoride henüz olay yok.</p>
        )}
      </div>
    </Page>
  );
}
