"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative"
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Haberlerde ara…"
        aria-label="Ara"
        className="w-full rounded-full border border-line bg-canvas py-2 pl-8 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-paper focus:outline-none"
      />
    </form>
  );
}
