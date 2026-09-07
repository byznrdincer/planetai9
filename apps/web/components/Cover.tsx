import { categoryLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { catColor } from "@/lib/category";

export function Cover({
  src,
  category,
  className = "",
  rounded = "rounded-lg",
}: {
  src: string | null;
  category: string;
  className?: string;
  rounded?: string;
}) {
  const hue = catColor(category);
  return (
    <div className={`relative overflow-hidden bg-wash ${rounded} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: `linear-gradient(145deg, ${hue}, ${hue}22)` }}
        />
      )}
    </div>
  );
}

export function CatBadge({ category, locale = "tr" }: { category: string; locale?: Locale }) {
  return (
    <span className="cat-badge" style={{ backgroundColor: catColor(category) }}>
      {categoryLabel(category, locale)}
    </span>
  );
}
