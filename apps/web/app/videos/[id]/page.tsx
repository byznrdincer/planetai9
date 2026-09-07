import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import type { VideoDetail } from "@/lib/types";

export const revalidate = 300;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let video: VideoDetail;
  try {
    video = await api<VideoDetail>(`/videos/${id}`, { revalidate: 300 });
  } catch {
    notFound();
  }

  return (
    <Page section="Video" title={video.title} wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="aspect-video overflow-hidden border border-line">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div>
            <h2 className="text-xl font-black leading-snug tracking-tight">{video.title}</h2>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
              {relativeTime(video.published_at)}
            </p>
          </div>
          {video.description && (
            <p className="card whitespace-pre-wrap p-4 text-sm text-ink-2">{video.description}</p>
          )}
        </div>

        <aside className="space-y-8">
          {(video.related_entities.length > 0 || video.related_topics.length > 0) && (
            <div>
              <p className="eyebrow mb-2">Bu videoyla ilgili</p>
              <div className="flex flex-wrap gap-2">
                {video.related_entities.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/search?q=${encodeURIComponent(e.name)}`}
                    className="chip"
                  >
                    {e.name}
                  </Link>
                ))}
                {video.related_topics.map((t) => (
                  <Link key={t.slug} href={`/trends/${t.slug}`} className="chip">
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {video.related_events.length > 0 && (
            <div>
              <p className="eyebrow mb-3">İlgili haberler</p>
              <div className="grid gap-3">
                {video.related_events.map((e) => (
                  <EventCard key={e.slug} event={e} compact />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
}
