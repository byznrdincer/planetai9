export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <div className="aspect-[16/9] rounded-card bg-wash dark:bg-d-wash" />
          <div className="h-8 w-3/4 rounded bg-wash dark:bg-d-wash" />
          <div className="h-4 w-full rounded bg-wash dark:bg-d-wash" />
        </div>
        <div className="h-72 rounded-card bg-wash dark:bg-d-wash" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[16/10] rounded-xl bg-wash dark:bg-d-wash" />
            <div className="h-4 w-5/6 rounded bg-wash dark:bg-d-wash" />
          </div>
        ))}
      </div>
    </div>
  );
}
