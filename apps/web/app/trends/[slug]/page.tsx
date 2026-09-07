import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { api } from "@/lib/api";
import type { TopicTrend } from "@/lib/types";

export const revalidate = 120;

export default async function TrendDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let trend: TopicTrend;
  try {
    trend = await api<TopicTrend>(`/trends/${slug}`, { revalidate: 120 });
  } catch {
    notFound();
  }
  const up = trend.delta_pct >= 0;

  return (
    <Page
      title={`#${trend.topic.name.replace(/\s+/g, "")}`}
      lead={`Son ${trend.window === "24h" ? "24 saatte" : "7 günde"} ${trend.event_count} haber · ${
        up ? "▲" : "▼"
      } ${Math.abs(trend.delta_pct).toFixed(0)}%`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trend.sample_events.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
    </Page>
  );
}
