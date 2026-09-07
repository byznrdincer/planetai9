import Link from "next/link";
import { Flame } from "lucide-react";
import { NewsletterCard } from "@/components/NewsletterCard";
import type { DictT, Locale } from "@/lib/i18n";
import type { TopicTrend } from "@/lib/types";

export function TrendsCard({ trends, t }: { trends: TopicTrend[]; t: DictT }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold tracking-tight3 text-ink dark:text-d-ink">
        <Flame className="h-4 w-4 text-live" strokeWidth={2.2} />
        {t.section.trends}
      </h3>
      <ol className="space-y-3.5">
        {trends.slice(0, 5).map((tr, i) => {
          const lead = tr.sample_events[0];
          return (
            <li key={tr.topic.slug}>
              <Link href={`/trends/${tr.topic.slug}`} className="group flex gap-3.5">
                <span className="w-4 shrink-0 text-[15px] font-extrabold text-muted">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold leading-snug tracking-tight2 text-ink transition-colors group-hover:text-accent dark:text-d-ink">
                    {tr.topic.name}
                  </span>
                  {lead?.primary_entity && (
                    <span className="block text-[12px] text-ink-2 dark:text-d-ink-2">
                      {lead.primary_entity.name}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
        {trends.length === 0 && (
          <li className="text-[13px] text-ink-2 dark:text-d-ink-2">{t.common.noData}</li>
        )}
      </ol>
    </div>
  );
}

export function HomeSidebar({
  trends,
  t,
  locale,
}: {
  trends: TopicTrend[];
  t: DictT;
  locale: Locale;
}) {
  return (
    <aside className="space-y-6">
      <TrendsCard trends={trends} t={t} />
      <NewsletterCard locale={locale} />
    </aside>
  );
}
