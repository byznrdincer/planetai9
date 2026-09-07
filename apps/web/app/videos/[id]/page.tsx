import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="aspect-video overflow-hidden rounded-xl border border-border">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div>
        <h1 className="text-xl font-semibold leading-snug">{video.title}</h1>
        <p className="mt-1 text-xs text-text-dim">{relativeTime(video.published_at)}</p>
      </div>

      {(video.related_entities.length > 0 || video.related_topics.length > 0) && (
        <section>
          <h2 className="section-title mb-2">Related to this video</h2>
          <div className="flex flex-wrap gap-2">
            {video.related_entities.map((e) => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.name)}`} className="chip">
                {e.name}
              </Link>
            ))}
            {video.related_topics.map((t) => (
              <Link key={t.slug} href={`/trends/${t.slug}`} className="chip">
                #{t.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {video.related_events.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Related news</h2>
          <div className="grid gap-3">
            {video.related_events.map((e) => (
              <EventCard key={e.slug} event={e} compact />
            ))}
          </div>
        </section>
      )}

      {video.description && (
        <section className="card whitespace-pre-wrap p-4 text-sm text-text-dim">
          {video.description}
        </section>
      )}
    </div>
  );
}
