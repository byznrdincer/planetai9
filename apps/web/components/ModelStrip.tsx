import Link from "next/link";
import type { EntityRef } from "@/lib/types";

export function ModelStrip({ models }: { models: (EntityRef & { description?: string | null })[] }) {
  if (models.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {models.slice(0, 5).map((m) => (
        <Link
          key={m.slug}
          href={`/entities/${m.slug}`}
          className="card group flex flex-col gap-2 p-4 hover:border-accent/40"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-wash text-sm font-black text-ink-2">
            {m.name.slice(0, 1)}
          </span>
          <span className="text-sm font-bold text-ink group-hover:text-accent">{m.name}</span>
          {m.description && (
            <span className="line-clamp-2 text-[12px] leading-snug text-muted">{m.description}</span>
          )}
          <span className="mt-auto text-accent">→</span>
        </Link>
      ))}
    </div>
  );
}
