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
      <div className="section-head">
        <h1 className="headline text-2xl">{title}</h1>
      </div>
      {lead && <p className="-mt-2 mb-6 max-w-xl text-sm text-ink-2">{lead}</p>}
      {children}
    </div>
  );
}
