import Link from "next/link";

export type SegOption = { label: string; href: string; active: boolean };

/** Compact segmented control (one pill-group, dividers between) rendered as links.
 *  Reads as a single control rather than a scatter of loose chips. */
export function Segmented({ label, options }: { label?: string; options: SegOption[] }) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          {label}
        </span>
      )}
      <div className="inline-flex rounded-lg border border-line bg-wash p-0.5 dark:border-d-line dark:bg-d-wash">
        {options.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            aria-current={o.active ? "true" : undefined}
            className={`rounded-[6px] px-2.5 py-1 text-[12.5px] font-medium transition-colors ${
              o.active
                ? "bg-paper text-ink shadow-soft dark:bg-d-paper dark:text-d-ink"
                : "text-ink-2 hover:text-ink dark:text-d-ink-2 dark:hover:text-d-ink"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
