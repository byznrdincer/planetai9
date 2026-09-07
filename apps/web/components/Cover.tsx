import { categoryLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { catColor } from "@/lib/category";

export function Cover({
  src,
  category,
  className = "",
  rounded = "rounded-xl",
  zoom = false,
}: {
  src: string | null;
  category: string;
  className?: string;
  rounded?: string;
  zoom?: boolean;
}) {
  const hue = catColor(category);
  return (
    <div className={`relative overflow-hidden bg-wash dark:bg-d-wash ${rounded} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-transform duration-500 ${
            zoom ? "group-hover:scale-105" : ""
          }`}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: `linear-gradient(140deg, ${hue}, ${hue}18)` }}
        />
      )}
    </div>
  );
}

export function CatBadge({
  category,
  locale = "tr",
  className = "",
}: {
  category: string;
  locale?: Locale;
  className?: string;
}) {
  return <span className={`badge ${className}`}>{categoryLabel(category, locale)}</span>;
}
