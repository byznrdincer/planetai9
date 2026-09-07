import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { api } from "@/lib/api";
import { dateLabel } from "@/lib/format";
import type { AuthorDetail, ColumnCard } from "@/lib/types";

export const revalidate = 180;

const LINK_LABEL: Record<string, string> = { youtube: "YouTube", site: "Web", x: "X", linkedin: "LinkedIn" };

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data: { author: AuthorDetail; columns: ColumnCard[] };
  try {
    data = await api(`/authors/${slug}`, { revalidate: 180 });
  } catch {
    notFound();
  }
  const { author, columns } = data;

  return (
    <Page title={author.name} lead={author.role ?? undefined}>
      {author.bio && <p className="max-w-2xl text-[15px] leading-relaxed text-ink-2">{author.bio}</p>}
      {Object.keys(author.links ?? {}).length > 0 && (
        <div className="mt-3 flex gap-3 text-sm">
          {Object.entries(author.links).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="link-accent">
              {LINK_LABEL[k] ?? k} ↗
            </a>
          ))}
        </div>
      )}

      <ul className="mt-8 divide-y divide-line border-t-2 border-ink">
        {columns.map((c) => (
          <li key={c.slug} className="py-5">
            <Link href={`/kose/${c.slug}`} className="group block">
              <h2 className="headline text-xl leading-tight group-hover:text-accent">{c.title}</h2>
              {c.dek && <p className="mt-1.5 text-[14px] text-ink-2">{c.dek}</p>}
              <p className="mt-2 text-[11px] text-muted">{dateLabel(c.published_at)}</p>
            </Link>
          </li>
        ))}
        {columns.length === 0 && <li className="py-5 text-sm text-muted">Henüz köşe yazısı yok.</li>}
      </ul>
    </Page>
  );
}
