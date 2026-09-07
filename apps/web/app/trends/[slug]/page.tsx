import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { api } from "@/lib/api";
import type { TopicTrend } from "@/lib/types";

export const revalidate = 120;

export default async function TrendDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let trend: TopicTrend;
  try {
    trend = await api<TopicTrend>(`/trends/${slug}`, { revalidate: 120 });
  } catch {
    notFound();
  }
  const up = trend.delta_pct >= 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">#{trend.topic.name}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {trend.event_count} events in the last {trend.window} ·{" "}
          <span className={up ? "text-pos" : "text-neg"}>
            {up ? "↑" : "↓"} {Math.abs(trend.delta_pct).toFixed(0)}%
          </span>{" "}
          · weighted score {trend.weighted_score.toFixed(1)}
        </p>
      </div>
      <div className="grid gap-3">
        {trend.sample_events.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
    </div>
  );
}
