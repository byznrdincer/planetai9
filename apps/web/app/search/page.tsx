import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
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

  const empty =
    q.length >= 2 &&
    result.entities.length === 0 &&
    result.events.data.length === 0 &&
    result.videos.length === 0;

  return (
    <Page section="Arama" title={q ? `“${q}”` : "AI evreninde ara"} wide>
      {q.length < 2 && <p className="text-sm text-muted">En az iki karakter yazın.</p>}

      <div className="space-y-10">
        {result.entities.length > 0 && (
          <section>
            <p className="eyebrow mb-2">Entities</p>
            <div className="flex flex-wrap gap-2">
              {result.entities.map((e) => (
                <span key={e.slug} className="chip border-sage/50 text-sage">
                  {e.name} · {e.type}
                </span>
              ))}
            </div>
          </section>
        )}

        {result.events.data.length > 0 && (
          <section>
            <p className="eyebrow mb-3">Haberler · {result.events.count}</p>
            <div className="grid gap-3">
              {result.events.data.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </section>
        )}

        {result.research.data.length > 0 && (
          <section>
            <p className="eyebrow mb-3">Araştırma · {result.research.count}</p>
            <div className="grid gap-3">
              {result.research.data.map((e) => (
                <EventCard key={e.slug} event={e} compact />
              ))}
            </div>
          </section>
        )}

        {result.videos.length > 0 && (
          <section>
            <p className="eyebrow mb-3">Video · {result.videos.length}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {result.videos.map((v) => (
                <VideoCard key={v.youtube_id} video={v} />
              ))}
            </div>
          </section>
        )}

        {empty && (
          <p className="text-sm text-muted">
            “{q}” için sonuç yok. <Link href="/news" className="link-accent">Haberlere göz at →</Link>
          </p>
        )}
      </div>
    </Page>
  );
}
