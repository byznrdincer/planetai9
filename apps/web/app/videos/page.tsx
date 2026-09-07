import { Page } from "@/components/Page";
import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import type { VideoCard as VideoCardT } from "@/lib/types";

export const revalidate = 300;

export default async function VideosPage() {
  const videos = await apiSafe<VideoCardT[]>("/videos?limit=36", []);

  return (
    <Page section="Medya" title="PlanetAI Video" wide>
      <p className="mb-6 max-w-lg text-sm text-ink-2">
        PlanetAI&apos;nin medya ayağı — explainer&apos;lar, model incelemeleri ve AI haberleri.
      </p>
      {videos.length === 0 ? (
        <div className="card p-6 text-sm text-ink-2">
          Henüz video yok. <code className="text-sage">PLANETAI_YOUTUBE_API_KEY</code> ve{" "}
          <code className="text-sage">PLANETAI_YOUTUBE_CHANNEL_ID</code> ayarlayıp{" "}
          <code className="text-sage">planetai-ingest collect --kinds youtube</code> çalıştırın.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.youtube_id} video={v} />
          ))}
        </div>
      )}
    </Page>
  );
}
