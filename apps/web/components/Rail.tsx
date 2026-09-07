import Link from "next/link";
import { clockTime } from "@/lib/format";
import type { EventCard, TimelineItem, TopicTrend } from "@/lib/types";
import { categoryLabel } from "@/lib/format";

function RailHead({ title, href, dot }: { title: string; href?: string; dot?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-[15px] font-black tracking-tight text-ink">
        {dot && <span className="h-2 w-2 rounded-full bg-live" />}
        {title}
      </h3>
      {href && (
        <Link href={href} className="text-[11px] font-semibold text-accent hover:text-accent-ink">
          Tümünü gör →
        </Link>
      )}
    </div>
  );
}

export function SonDakika({ items }: { items: TimelineItem[] }) {
  return (
    <div className="card p-4">
      <RailHead title="Son Dakika" href="/news" dot />
      <ul className="space-y-3">
        {items.slice(0, 5).map((t) => (
          <li key={t.slug}>
            <Link href={`/news/${t.slug}`} className="group flex gap-2.5">
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted">{clockTime(t.time)}</span>
              <span>
                <span className="block text-[13px] font-semibold leading-snug text-ink group-hover:text-accent">
                  {t.title}
                </span>
                <span className="text-[11px] text-muted">{categoryLabel(t.category)}</span>
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="text-[13px] text-muted">Şu an sakin.</li>}
      </ul>
    </div>
  );
}

export function TrendPills({ trends }: { trends: TopicTrend[] }) {
  return (
    <div className="card p-4">
      <RailHead title="Trendler" href="/trends" />
      <div className="flex flex-wrap gap-2">
        {trends.map((t) => (
          <Link key={t.topic.slug} href={`/trends/${t.topic.slug}`} className="pill">
            #{t.topic.name.replace(/\s+/g, "")}
          </Link>
        ))}
        {trends.length === 0 && <span className="text-[13px] text-muted">Veri yok.</span>}
      </div>
    </div>
  );
}

export function GundemList({ events }: { events: EventCard[] }) {
  return (
    <div className="card p-4">
      <RailHead title="Bugünün Yapay Zekâ Gündemi" href="/news?sort=importance" />
      <ol className="space-y-2.5">
        {events.slice(0, 5).map((e, i) => (
          <li key={e.slug}>
            <Link href={`/news/${e.slug}`} className="group flex gap-3">
              <span className="text-[13px] font-black text-line">{i + 1}</span>
              <span className="text-[13px] font-semibold leading-snug text-ink-2 group-hover:text-accent">
                {e.title}
              </span>
            </Link>
          </li>
        ))}
        {events.length === 0 && <li className="text-[13px] text-muted">Veri yok.</li>}
      </ol>
    </div>
  );
}
