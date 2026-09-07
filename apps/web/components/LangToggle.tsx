"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LangToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function set(next: Locale) {
    if (next === locale) return;
    document.cookie = `planetai_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-full border border-line p-0.5 text-[11px] font-bold dark:border-d-line">
      {(["tr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2 py-1 uppercase transition-colors ${
            locale === l
              ? "bg-ink text-white dark:bg-white dark:text-ink"
              : "text-muted hover:text-ink dark:hover:text-d-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
