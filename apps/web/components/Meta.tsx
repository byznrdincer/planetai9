import { Clock } from "lucide-react";
import { dateLabel } from "@/lib/format";
import { readingLabel } from "@/lib/reading";
import type { Locale } from "@/lib/i18n";

export function Meta({
  summary,
  date,
  source,
  locale,
  className = "",
}: {
  summary?: string | null;
  date: string;
  source?: string | null;
  locale: Locale;
  className?: string;
}) {
  return (
    <div className={`meta ${className}`}>
      <Clock className="h-3 w-3 shrink-0" strokeWidth={2} />
      <span>{readingLabel(summary, locale)}</span>
      <span aria-hidden>·</span>
      <span>{dateLabel(date, locale)}</span>
      {source && (
        <>
          <span aria-hidden>·</span>
          <span className="font-medium text-ink dark:text-d-ink">{source}</span>
        </>
      )}
    </div>
  );
}
