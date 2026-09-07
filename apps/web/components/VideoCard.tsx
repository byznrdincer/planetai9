import Link from "next/link";
import { duration, relativeTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { VideoCard as VideoCardT } from "@/lib/types";

export function VideoCard({ video, locale = "tr" }: { video: VideoCardT; locale?: Locale }) {
  return (
    <Link href={`/videos/${video.youtube_id}`} className="card group block overflow-hidden">
      <div className="relative aspect-video bg-wash">
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
          <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/90 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {duration(video.duration_sec)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-accent">
          {video.title}
        </h3>
        <p className="mt-1 text-[11px] text-muted">{relativeTime(video.published_at, locale)}</p>
      </div>
    </Link>
  );
}
