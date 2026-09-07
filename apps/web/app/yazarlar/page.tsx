import Link from "next/link";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { dateLabel } from "@/lib/format";
import type { AuthorRef, ColumnCard } from "@/lib/types";

export const revalidate = 120;

export default async function AuthorsPage() {
  const [authors, columns] = await Promise.all([
    apiSafe<AuthorRef[]>("/authors", []),
    apiSafe<ColumnCard[]>("/columns?limit=40", []),
  ]);

  return (
    <Page title="Yazarlar" lead="PlanetAI köşe yazıları — sektörün kırılma noktaları ve Türkiye'nin yapay zekâ ekosistemi.">
      <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
        <div>
          {columns.length === 0 ? (
            <p className="text-sm text-muted">Köşe yazıları çok yakında yayında.</p>
          ) : (
            <ul className="divide-y divide-line border-t-2 border-ink">
              {columns.map((c) => (
                <li key={c.slug} className="py-5">
                  <Link href={`/kose/${c.slug}`} className="group block">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      {c.author.name}
                      {c.author.role ? ` · ${c.author.role}` : ""}
                    </p>
                    <h2 className="headline mt-1 text-xl leading-tight group-hover:text-accent">
                      {c.title}
                    </h2>
                    {c.dek && <p className="mt-1.5 text-[14px] text-ink-2">{c.dek}</p>}
                    <p className="mt-2 text-[11px] text-muted">{dateLabel(c.published_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside>
          <h3 className="mb-3 border-b-2 border-ink pb-1.5 text-[15px] font-black tracking-tight">
            Yazarlar
          </h3>
          <ul className="divide-y divide-line">
            {authors.map((a) => (
              <li key={a.slug}>
                <Link href={`/yazarlar/${a.slug}`} className="group block py-3">
                  <p className="text-[14px] font-bold text-ink group-hover:text-accent">{a.name}</p>
                  {a.role && <p className="text-[11px] text-muted">{a.role}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Page>
  );
}
