import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { Page } from "@/components/Page";
import { api } from "@/lib/api";
import { getLocale } from "@/lib/i18n";
import type { TopicTrend } from "@/lib/types";

export const revalidate = 120;

export default async function TrendDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  let trend: TopicTrend;
  try {
    trend = await api<TopicTrend>(`/trends/${slug}`, { revalidate: 120 });
  } catch {
    notFound();
  }
  const up = trend.delta_pct >= 0;
  const w = trend.window === "24h" ? (locale === "tr" ? "24 saatte" : "24h") : locale === "tr" ? "7 günde" : "7d";
  const stories = locale === "tr" ? "haber" : "stories";

  return (
    <Page
      title={`#${trend.topic.name.replace(/\s+/g, "")}`}
      lead={`${locale === "tr" ? "Son" : "Last"} ${w} · ${trend.event_count} ${stories} · ${
        up ? "▲" : "▼"
      } ${Math.abs(trend.delta_pct).toFixed(0)}%`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trend.sample_events.map((e) => (
          <EventCard key={e.slug} event={e} locale={locale} />
        ))}
      </div>
    </Page>
  );
}
