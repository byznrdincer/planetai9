import { apiSafe } from "@/lib/api";
import type { SourceRef } from "@/lib/types";

export const revalidate = 3600;

const TYPE_LABEL: Record<string, string> = {
  primary: "Primary",
  official_announcement: "Official announcement",
  major_news: "Major news outlet",
  research_paper: "Research",
  community: "Community",
  social: "Social",
};

export default async function SourcesPage() {
  const sources = await apiSafe<SourceRef[]>("/sources", []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sources & Trust</h1>
        <p className="mt-1 text-sm text-text-dim">
          Every signal on PlanetAI links back to its original publisher. Trust weight feeds the
          importance score.
        </p>
      </div>
      <div className="card divide-y divide-border">
        {sources.map((s) => (
          <a
            key={s.slug}
            href={s.homepage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 text-sm hover:bg-surface-2"
          >
            <span className="flex-1 font-medium">{s.name}</span>
            <span className="chip">{TYPE_LABEL[s.source_type] ?? s.source_type}</span>
            <span className="w-24 text-right text-xs text-text-dim">
              trust {s.trust_weight.toFixed(2)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
