import type { ReactNode } from "react";

/** Bold editorial section header: accent number chip, kicker + title, strong bottom rule. */
export function SectionHeader({
  index,
  kicker,
  title,
  action,
  className = "",
}: {
  index?: string;
  kicker?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-8 flex items-end justify-between gap-4 border-b-[3px] border-ink pb-3 dark:border-d-ink ${className}`}
    >
      <div className="flex items-center gap-3.5">
        {index && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-[14px] font-extrabold tabular-nums text-white">
            {index}
          </span>
        )}
        <div>
          {kicker && (
            <span className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">
              {kicker}
            </span>
          )}
          <h2 className="text-[23px] font-extrabold leading-none tracking-tight3 text-ink dark:text-d-ink sm:text-[27px]">
            {title}
          </h2>
        </div>
      </div>
      {action && (
        <div className="shrink-0 pb-1 text-[12px] font-semibold text-accent">{action}</div>
      )}
    </div>
  );
}
