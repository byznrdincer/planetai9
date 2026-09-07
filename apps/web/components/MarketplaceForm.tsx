"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const CATEGORIES: Record<string, { tr: string; en: string }> = {
  mcp: { tr: "MCP Sunucusu", en: "MCP Server" },
  llm: { tr: "LLM", en: "LLM" },
  stt: { tr: "Konuşma → Metin (STT)", en: "Speech → Text (STT)" },
  tts: { tr: "Metin → Konuşma (TTS)", en: "Text → Speech (TTS)" },
  agent: { tr: "Ajan", en: "Agent" },
  tool: { tr: "Araç", en: "Tool" },
  other: { tr: "Diğer", en: "Other" },
};

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function MarketplaceForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { submitted: string; send: string; sending: string };
}) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const tr = locale === "tr";
  const L = (a: string, b: string) => (tr ? a : b);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ? JSON.stringify(body.detail) : `HTTP ${res.status}`);
      }
      setState("ok");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : L("Bir hata oluştu", "Something went wrong"));
    }
  }

  if (state === "ok") {
    return (
      <div className="mt-5 rounded-lg border border-accent bg-accent/5 p-5 text-sm text-ink-2">
        {labels.submitted}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
      <input name="name" required minLength={2} placeholder={L("Uygulama adı *", "App name *")} className={field} />
      <select name="category" required defaultValue="" className={field}>
        <option value="" disabled>
          {L("Kategori *", "Category *")}
        </option>
        {Object.entries(CATEGORIES).map(([v, l]) => (
          <option key={v} value={v}>
            {l[locale]}
          </option>
        ))}
      </select>
      <input
        name="tagline"
        required
        minLength={8}
        maxLength={240}
        placeholder={L("Tek cümlelik açıklama *", "One-line description *")}
        className={`${field} sm:col-span-2`}
      />
      <input
        name="url"
        type="url"
        required
        placeholder={L("Web sitesi / uygulama linki *", "Website / app link *")}
        className={field}
      />
      <input
        name="repo_url"
        type="url"
        placeholder={L("Kaynak kod (GitHub) linki", "Source code (GitHub) link")}
        className={field}
      />
      <textarea
        name="description"
        rows={3}
        maxLength={4000}
        placeholder={L("Detaylı açıklama (opsiyonel)", "Detailed description (optional)")}
        className={`${field} sm:col-span-2`}
      />
      <input
        name="author_name"
        required
        minLength={2}
        placeholder={L("Geliştirici / ekip adı *", "Developer / team name *")}
        className={field}
      />
      <input
        name="author_url"
        type="url"
        placeholder={L("Geliştirici linki (opsiyonel)", "Developer link (optional)")}
        className={field}
      />
      <select name="pricing" defaultValue="free" className={field}>
        <option value="free">{L("Ücretsiz", "Free")}</option>
        <option value="freemium">Freemium</option>
        <option value="paid">{L("Ücretli", "Paid")}</option>
      </select>
      <input
        name="submitter_email"
        type="email"
        placeholder={L("E-posta (yayınlanmaz)", "Email (not published)")}
        className={field}
      />
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-accent disabled:opacity-50"
        >
          {state === "sending" ? labels.sending : labels.send}
        </button>
        {state === "error" && <span className="ml-3 text-sm text-live">{msg}</span>}
      </div>
    </form>
  );
}
