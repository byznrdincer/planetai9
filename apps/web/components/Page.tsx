export function Page({
  title,
  lead,
  children,
  wide = true,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "" : "mx-auto max-w-3xl"}>
      <div className="mb-6 flex items-center gap-2">
        <span className="h-5 w-1 rounded bg-accent" />
        <h1 className="text-2xl font-black tracking-tight text-ink">{title}</h1>
      </div>
      {lead && <p className="-mt-3 mb-6 max-w-xl text-sm text-ink-2">{lead}</p>}
      {children}
    </div>
  );
}
