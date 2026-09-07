"use client";

import { useState } from "react";

const CATEGORIES: [string, string][] = [
  ["mcp", "MCP Sunucusu"],
  ["llm", "LLM"],
  ["stt", "Konuşma → Metin (STT)"],
  ["tts", "Metin → Konuşma (TTS)"],
  ["agent", "Ajan"],
  ["tool", "Araç"],
  ["other", "Diğer"],
];

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function MarketplaceForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

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
      setMsg(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  }

  if (state === "ok") {
    return (
      <div className="mt-5 rounded-lg border border-accent bg-accent/5 p-5 text-sm text-ink-2">
        Teşekkürler! Uygulaman inceleme kuyruğuna alındı. Onaylandığında Marketplace&apos;te
        görünecek.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
      <input name="name" required minLength={2} placeholder="Uygulama adı *" className={field} />
      <select name="category" required defaultValue="" className={field}>
        <option value="" disabled>
          Kategori *
        </option>
        {CATEGORIES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <input
        name="tagline"
        required
        minLength={8}
        maxLength={240}
        placeholder="Tek cümlelik açıklama *"
        className={`${field} sm:col-span-2`}
      />
      <input name="url" type="url" required placeholder="Web sitesi / uygulama linki *" className={field} />
      <input name="repo_url" type="url" placeholder="Kaynak kod (GitHub) linki" className={field} />
      <textarea
        name="description"
        rows={3}
        maxLength={4000}
        placeholder="Detaylı açıklama (opsiyonel)"
        className={`${field} sm:col-span-2`}
      />
      <input name="author_name" required minLength={2} placeholder="Geliştirici / ekip adı *" className={field} />
      <input name="author_url" type="url" placeholder="Geliştirici linki (opsiyonel)" className={field} />
      <select name="pricing" defaultValue="free" className={field}>
        <option value="free">Ücretsiz</option>
        <option value="freemium">Freemium</option>
        <option value="paid">Ücretli</option>
      </select>
      <input
        name="submitter_email"
        type="email"
        placeholder="E-posta (yayınlanmaz, sadece iletişim)"
        className={field}
      />
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-accent disabled:opacity-50"
        >
          {state === "sending" ? "Gönderiliyor…" : "Gönder"}
        </button>
        {state === "error" && <span className="ml-3 text-sm text-live">{msg}</span>}
      </div>
    </form>
  );
}
