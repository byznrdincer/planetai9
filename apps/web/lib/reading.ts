import type { Locale } from "./i18n";

/** Rough estimate — we only hold the headline + blurb, so this is a floor. */
export function readingMinutes(summary: string | null | undefined): number {
  const words = (summary ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.min(9, Math.max(2, 2 + Math.round(words / 45)));
}

export function readingLabel(summary: string | null | undefined, locale: Locale): string {
  const m = readingMinutes(summary);
  return locale === "tr" ? `${m} dk okuma` : `${m} min read`;
}
