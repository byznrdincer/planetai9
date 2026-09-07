import Link from "next/link";
import { Play } from "lucide-react";
import { duration, relativeTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { VideoCard as VideoCardT } from "@/lib/types";

export function VideoCard({ video, locale = "tr" }: { video: VideoCardT; locale?: Locale }) {
  return (
    <Link href={`/videos/${video.youtube_id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-wash dark:bg-d-wash">
        {video.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-raise transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 translate-x-[1px] fill-current" />
          </span>
        </span>
        {video.duration_sec > 0 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {duration(video.duration_sec)}
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-[14px] font-bold leading-snug tracking-tight2 text-ink transition-colors group-hover:text-accent dark:text-d-ink">
        {video.title}
      </h3>
      <p className="mt-1 text-[12px] text-ink-2 dark:text-d-ink-2">
        {relativeTime(video.published_at, locale)}
      </p>
    </Link>
  );
}
