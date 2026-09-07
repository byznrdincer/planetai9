import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMPTY: SearchResult = {
  query: "",
  entities: [],
  events: { data: [], next_cursor: null, count: 0 },
  videos: [],
  research: { data: [], next_cursor: null, count: 0 },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? "";
  const result =
    q.length >= 2 ? await apiSafe<SearchResult>(`/search?q=${encodeURIComponent(q)}`, EMPTY) : EMPTY;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {q ? `Search: ${q}` : "Search the AI universe"}
      </h1>

      {q.length < 2 && <p className="text-sm text-text-dim">Type at least two characters.</p>}

      {result.entities.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Entities</h2>
          <div className="flex flex-wrap gap-2">
            {result.entities.map((e) => (
              <span key={e.slug} className="chip border-accent/40 text-accent">
                {e.name} · {e.type}
              </span>
            ))}
          </div>
        </section>
      )}

      {result.events.data.length > 0 && (
        <section>
          <h2 className="section-title mb-3">News · {result.events.count}</h2>
          <div className="grid gap-3">
            {result.events.data.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}

      {result.research.data.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Research · {result.research.count}</h2>
          <div className="grid gap-3">
            {result.research.data.map((e) => (
              <EventCard key={e.slug} event={e} compact />
            ))}
          </div>
        </section>
      )}

      {result.videos.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Videos · {result.videos.length}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.videos.map((v) => (
              <VideoCard key={v.youtube_id} video={v} />
            ))}
          </div>
        </section>
      )}

      {q.length >= 2 &&
        result.entities.length === 0 &&
        result.events.data.length === 0 &&
        result.videos.length === 0 && (
          <p className="text-sm text-text-dim">
            No results for “{q}”. <Link href="/news" className="text-accent">Browse news →</Link>
          </p>
        )}
    </div>
  );
}
