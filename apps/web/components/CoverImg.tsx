"use client";

import { useState } from "react";

/** Route publisher images through our proxy so hot-link-blocked hosts (Reddit…) still load. */
function proxied(src: string): string {
  if (src.startsWith("/") || src.startsWith("data:")) return src;
  return `/img?u=${encodeURIComponent(src)}`;
}

/** <img> that removes itself on load failure so the parent's gradient placeholder shows through. */
export function CoverImg({ src, zoom = false }: { src: string; zoom?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={proxied(src)}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
        zoom ? "group-hover:scale-105" : ""
      }`}
    />
  );
}
