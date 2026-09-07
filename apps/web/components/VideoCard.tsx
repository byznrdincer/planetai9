import Link from "next/link";
import { duration, relativeTime } from "@/lib/format";
import type { VideoCard as VideoCardT } from "@/lib/types";

export function VideoCard({ video }: { video: VideoCardT }) {
  return (
    <Link href={`/videos/${video.youtube_id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded bg-wash">
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
          <span className="absolute bottom-1.5 right-1.5 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {duration(video.duration_sec)}
          </span>
        )}
      </div>
      <h3 className="mt-2 headline line-clamp-2 text-sm leading-snug group-hover:text-brand-ink">
        {video.title}
      </h3>
      <p className="mt-1 text-[11px] text-muted">{relativeTime(video.published_at)}</p>
    </Link>
  );
}
