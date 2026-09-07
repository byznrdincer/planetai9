import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
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
    <Page section="Trend" title={`#${trend.topic.name}`}>
      <p className="mb-6 text-sm text-ink-2">
        Son {trend.window} içinde {trend.event_count} olay ·{" "}
        <span className={up ? "text-sage" : "text-impact-critical"}>
          {up ? "↑" : "↓"} {Math.abs(trend.delta_pct).toFixed(0)}%
        </span>{" "}
        · ağırlıklı skor {trend.weighted_score.toFixed(1)}
      </p>
      <div className="grid gap-3">
        {trend.sample_events.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
    </Page>
  );
}
