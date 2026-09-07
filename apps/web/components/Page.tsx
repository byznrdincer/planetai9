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
      <header className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight3 text-ink dark:text-d-ink sm:text-[32px]">
          {title}
        </h1>
        {lead && (
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2 dark:text-d-ink-2">
            {lead}
          </p>
        )}
      </header>
      {children}
    </div>
  );
}
