import Link from "next/link";
import { duration, relativeTime } from "@/lib/format";
import type { VideoCard as VideoCardT } from "@/lib/types";

export function VideoCard({ video }: { video: VideoCardT }) {
  return (
    <Link href={`/videos/${video.youtube_id}`} className="card card-hover group block overflow-hidden">
      <div className="relative aspect-video bg-surface-2">
        {video.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
          />
        )}
        {video.duration_sec > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-bg">
            {duration(video.duration_sec)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight group-hover:text-sage">
          {video.title}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
          {relativeTime(video.published_at)}
        </p>
      </div>
    </Link>
  );
}
