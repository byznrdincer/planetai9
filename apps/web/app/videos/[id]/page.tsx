import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRow } from "@/components/EventCard";
import { api } from "@/lib/api";
import { dateLabel } from "@/lib/format";
import { getDict, getLocale } from "@/lib/i18n";
import type { VideoDetail } from "@/lib/types";

export const revalidate = 300;

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getDict();
  let video: VideoDetail;
  try {
    video = await api<VideoDetail>(`/videos/${id}`, { revalidate: 300 });
  } catch {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="aspect-video overflow-hidden rounded-xl border border-line">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <h1 className="text-2xl font-black leading-snug tracking-tight text-ink">{video.title}</h1>
        <p className="text-xs text-muted">{dateLabel(video.published_at, locale)}</p>
        {(video.related_entities.length > 0 || video.related_topics.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {video.related_entities.map((e) => (
              <Link key={e.slug} href={`/entities/${e.slug}`} className="pill">
                {e.name}
              </Link>
            ))}
            {video.related_topics.map((tp) => (
              <Link key={tp.slug} href={`/trends/${tp.slug}`} className="pill">
                #{tp.name.replace(/\s+/g, "")}
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
          <div className="card p-4">
            <h2 className="mb-2 text-[15px] font-black tracking-tight text-ink">{t.section.related}</h2>
            <div className="divide-y divide-line">
              {video.related_events.map((e) => (
                <EventRow key={e.slug} event={e} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
