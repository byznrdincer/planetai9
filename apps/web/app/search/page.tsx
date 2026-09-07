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
    <Page title={q ? `“${q}” için sonuçlar` : "Arama"}>
      {q.length < 2 && <p className="text-sm text-muted">En az iki karakter yazın.</p>}

      <div className="space-y-10">
        {result.entities.length > 0 && (
          <section>
            <p className="eyebrow mb-2">Kavramlar</p>
            <div className="flex flex-wrap gap-2">
              {result.entities.map((e) => (
                <span key={e.slug} className="chip bg-ink text-paper">
                  {e.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {result.events.data.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="headline text-lg">Haberler · {result.events.count}</h2>
            </div>
            <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {result.events.data.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </section>
        )}

        {result.research.data.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="headline text-lg">Araştırma · {result.research.count}</h2>
            </div>
            <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {result.research.data.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </section>
        )}

        {result.videos.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="headline text-lg">Video · {result.videos.length}</h2>
            </div>
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {result.videos.map((v) => (
                <VideoCard key={v.youtube_id} video={v} />
              ))}
            </div>
          </section>
        )}

        {empty && (
          <p className="text-sm text-muted">
            “{q}” için sonuç bulunamadı.{" "}
            <Link href="/news" className="link-accent">
              Haberlere göz atın →
            </Link>
          </p>
        )}
      </div>
    </Page>
  );
}
