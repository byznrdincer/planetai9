import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { apiSafe } from "@/lib/api";
import { categoryLabel } from "@/lib/format";
import type { CategoryCount, Page } from "@/lib/types";

export const revalidate = 60;

const CATEGORIES = [
  "All",
  "Models",
  "Companies",
  "Research",
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

  const qs = new URLSearchParams({ limit: "30", sort });
  if (category !== "All") qs.set("category", category);

  const [page, counts] = await Promise.all([
    apiSafe<Page>(`/events?${qs}`, { data: [], next_cursor: null, count: 0 }),
    apiSafe<CategoryCount[]>("/categories", []),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c.events_24h]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">AI News</h1>
        <div className="flex gap-1 text-xs">
          {(["recent", "importance"] as const).map((s) => (
            <Link
              key={s}
              href={`/news?category=${category}&sort=${s}`}
              className={`rounded-md px-2.5 py-1 ${
                sort === s ? "bg-surface-2 text-text" : "text-text-dim hover:text-text"
              }`}
            >
              {s === "recent" ? "Latest" : "Top"}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/news?category=${c}&sort=${sort}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              category === c
                ? "border-accent bg-accent/10 text-text"
                : "border-border text-text-dim hover:border-accent/40 hover:text-text"
            }`}
          >
            {c === "All" ? "All" : categoryLabel(c)}
            {c !== "All" && countMap[c] ? (
              <span className="ml-1 text-[10px] text-text-dim">{countMap[c]}</span>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="grid gap-3">
        {page.data.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
        {page.data.length === 0 && (
          <p className="text-sm text-text-dim">No events in this category yet.</p>
        )}
      </div>
    </div>
  );
}
