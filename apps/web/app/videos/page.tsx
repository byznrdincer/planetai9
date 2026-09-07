import { Page } from "@/components/Page";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import type { VideoCard as VideoCardT } from "@/lib/types";

export const revalidate = 300;

export default async function VideosPage() {
  const videos = await apiSafe<VideoCardT[]>("/videos?limit=36", []);

  return (
    <Page title="PlanetAI Video" lead="Açıklayıcı videolar, model incelemeleri ve yapay zekâ haberleri.">
      {videos.length === 0 ? (
        <div className="rounded border border-line bg-wash p-6 text-sm text-ink-2">
          Henüz video yok. YouTube API anahtarı ve kanal kimliği tanımlanınca videolar otomatik
          çekilecek.
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.youtube_id} video={v} />
          ))}
        </div>
      )}
    </Page>
  );
}
