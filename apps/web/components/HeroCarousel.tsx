"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/format";
import { catColor } from "@/lib/category";
import { categoryLabel } from "@/lib/format";
import type { EventCard } from "@/lib/types";

export function HeroCarousel({ slides }: { slides: EventCard[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;
  const e = slides[i];
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink sm:aspect-[2/1]">
      {slides.map((s, idx) => (
        <div
          key={s.slug}
          className={`absolute inset-0 transition-opacity duration-500 ${idx === i ? "opacity-100" : "opacity-0"}`}
        >
          {s.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.image_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `linear-gradient(135deg, ${catColor(s.category)}, #0b1220)` }}
            />
          )}
        </div>
      ))}
      <div className="hero-fade absolute inset-0" />

      <Link href={`/news/${e.slug}`} className="absolute inset-0 flex flex-col justify-end p-6 sm:p-9">
        <span
          className="cat-badge mb-3 w-fit"
          style={{ backgroundColor: catColor(e.category) }}
        >
          {categoryLabel(e.category)}
        </span>
        <h2 className="max-w-2xl text-2xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
          {e.title}
        </h2>
        {e.summary && (
          <p className="mt-3 line-clamp-2 max-w-xl text-sm text-white/80">{e.summary}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
          {e.top_source && <span className="font-semibold text-white/90">{e.top_source.name}</span>}
          <span>·</span>
          <span>{relativeTime(e.published_at)}</span>
        </div>
      </Link>

      {n > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 sm:bottom-9 sm:right-9">
          <span className="rounded-md bg-black/40 px-2 py-1 text-[11px] font-semibold tabular-nums text-white">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button
            aria-label="Önceki"
            onClick={() => go(-1)}
            className="grid h-8 w-8 place-items-center rounded-md bg-black/40 text-white hover:bg-black/60"
          >
            ‹
          </button>
          <button
            aria-label="Sonraki"
            onClick={() => go(1)}
            className="grid h-8 w-8 place-items-center rounded-md bg-black/40 text-white hover:bg-black/60"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
