import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard, EventRow } from "@/components/EventCard";
import { VideoCard } from "@/components/VideoCard";
import { Page } from "@/components/Page";
import { api } from "@/lib/api";
import type { EntityDetail } from "@/lib/types";

export const revalidate = 180;

const REL_LABEL: Record<string, string> = {
  develops: "geliştirir",
  owns: "sahibi",
  based_on: "temeli",
  competes_with: "rakip",
  powers: "güç verir",
  works_at: "çalışır",
  published_by: "yayınlayan",
  successor_of: "ardılı",
  integrates: "entegre",
};

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let entity: EntityDetail;
  try {
    entity = await api<EntityDetail>(`/entities/${slug}`, { revalidate: 180 });
  } catch {
    notFound();
  }

  return (
    <Page title={entity.name} lead={entity.description ?? undefined}>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-ink">Son Haberler</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {entity.latest_events.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
              {entity.latest_events.length === 0 && (
                <p className="text-sm text-muted">Bu kayıt için henüz haber yok.</p>
              )}
            </div>
          </section>

          {entity.videos.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-black tracking-tight text-ink">PlanetAI9 videoları</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {entity.videos.map((v) => (
                  <VideoCard key={v.youtube_id} video={v} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="card p-4">
            <h2 className="mb-2 text-[15px] font-black tracking-tight text-ink">İlişkiler</h2>
            <div className="divide-y divide-line">
              {entity.relations.map((r, i) => (
                <Link key={i} href={`/entities/${r.entity.slug}`} className="flex items-center gap-2 py-2.5 text-sm hover:text-accent">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    {r.direction === "out" ? "" : "← "}
                    {REL_LABEL[r.relation] ?? r.relation}
                  </span>
                  <span className="ml-auto font-semibold text-ink">{r.entity.name}</span>
                </Link>
              ))}
              {entity.relations.length === 0 && (
                <p className="py-2 text-sm text-muted">İlişki tanımlı değil.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}
