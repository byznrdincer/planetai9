import { VideoCard } from "@/components/VideoCard";
import { apiSafe } from "@/lib/api";
import type { VideoCard as VideoCardT } from "@/lib/types";

export const revalidate = 300;

export default async function VideosPage() {
  const videos = await apiSafe<VideoCardT[]>("/videos?limit=36", []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">PlanetAI Videos</h1>
        <p className="mt-1 text-sm text-text-dim">
          The media layer of PlanetAI — explainers, model reviews and AI news.
        </p>
      </div>
      {videos.length === 0 ? (
        <div className="card p-6 text-sm text-text-dim">
          No videos yet. Set <code className="text-accent">PLANETAI_YOUTUBE_API_KEY</code> and{" "}
          <code className="text-accent">PLANETAI_YOUTUBE_CHANNEL_ID</code>, then run{" "}
          <code className="text-accent">planetai-ingest collect --kinds youtube</code>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.youtube_id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
