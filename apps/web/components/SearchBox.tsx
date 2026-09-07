"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className={compact ? "w-full" : ""}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Haberlerde ara…"
        aria-label="Ara"
        className="w-full rounded-full border border-line bg-wash px-4 py-1.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
    </form>
  );
}
