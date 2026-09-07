import { Page } from "@/components/Page";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { VideoCard as VideoCardT } from "@/lib/types";

export const revalidate = 300;

export default async function VideosPage() {
  const locale = await getLocale();
  const t = await getDict();
  const videos = await apiSafe<VideoCardT[]>("/videos?limit=36", []);

  return (
    <Page
      title={t.section.video}
      lead={
        locale === "tr"
          ? "Açıklayıcı videolar, model incelemeleri ve yapay zekâ haberleri."
          : "Explainers, model reviews and AI news."
      }
    >
      {videos.length === 0 ? (
        <div className="card p-6 text-sm text-ink-2">
          {locale === "tr"
            ? "Henüz video yok. YouTube API anahtarı ve kanal kimliği tanımlanınca videolar otomatik çekilecek."
            : "No videos yet. Videos will be pulled automatically once the YouTube API key and channel ID are set."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.youtube_id} video={v} locale={locale} />
          ))}
        </div>
      )}
    </Page>
  );
}
