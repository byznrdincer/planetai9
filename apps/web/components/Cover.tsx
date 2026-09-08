import { categoryLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { catColor } from "@/lib/category";
import { CoverImg } from "./CoverImg";

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
      <div
        className="absolute inset-0 h-full w-full"
        style={{ background: `linear-gradient(140deg, ${hue}, ${hue}18)` }}
      />
      {src && <CoverImg src={src} zoom={zoom} />}
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
