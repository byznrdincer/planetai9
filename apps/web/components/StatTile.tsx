export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-t border-line pt-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-tightest text-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function compact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1).replace(".", ",")}K`;
  }
  return String(n);
}
