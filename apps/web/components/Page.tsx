export function Page({
  section,
  title,
  children,
  wide = false,
  lead,
}: {
  section: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  lead?: string;
}) {
  return (
    <div className={wide ? "" : "mx-auto max-w-3xl"}>
      <div className="mb-6">
        <p className="eyebrow">{section}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-ink">{title}</h1>
        {lead && <p className="mt-2 max-w-lg text-sm text-ink-2">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
