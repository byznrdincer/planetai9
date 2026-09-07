import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { api } from "@/lib/api";
import { dateLabel } from "@/lib/format";
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
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="aspect-video overflow-hidden rounded border border-line">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div>
          <h1 className="headline text-2xl leading-snug">{video.title}</h1>
          <p className="mt-1 text-xs text-muted">{dateLabel(video.published_at)}</p>
        </div>
        {(video.related_entities.length > 0 || video.related_topics.length > 0) && (
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
        )}
        {video.description && (
          <p className="whitespace-pre-wrap border-t border-line pt-4 text-sm text-ink-2">
            {video.description}
          </p>
        )}
      </div>

      <aside>
        {video.related_events.length > 0 && (
          <>
            <div className="section-head">
              <h2 className="headline text-lg">İlgili Haberler</h2>
            </div>
            <div className="space-y-7">
              {video.related_events.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
