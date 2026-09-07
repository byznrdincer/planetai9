import Link from "next/link";
import type { EntityListItem } from "@/lib/types";

export function EntityGrid({ entities }: { entities: EntityListItem[] }) {
  if (entities.length === 0) return <p className="text-sm text-muted">Kayıt yok.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entities.map((e) => (
        <Link key={e.slug} href={`/entities/${e.slug}`} className="card group p-4 hover:border-accent/40">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-wash text-sm font-black text-ink-2">
              {e.name.slice(0, 2)}
            </span>
            <span>
              <span className="block font-bold text-ink group-hover:text-accent">{e.name}</span>
              <span className="block text-[11px] uppercase tracking-wide text-muted">{e.type}</span>
            </span>
          </div>
          {e.description && (
            <p className="mt-3 line-clamp-2 text-[13px] text-ink-2">{e.description}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
