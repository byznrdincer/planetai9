"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, LogOut, RotateCcw, X } from "lucide-react";
import type { QueueApp } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Beklemede",
  approved: "Yayında",
  rejected: "Reddedildi",
};
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-accent-soft text-accent dark:bg-accent/15 dark:text-blue-300",
  approved: "bg-[#EAF7EF] text-success dark:bg-success/15",
  rejected: "bg-wash text-ink-2 dark:bg-d-wash dark:text-d-ink-2",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function LoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? "Giriş yapılamadı");
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Giriş yapılamadı");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-sm space-y-3 p-6">
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-semibold text-ink-2 dark:text-d-ink-2">
          Yönetim anahtarı
        </span>
        <input
          type="password"
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="field"
        />
      </label>
      {err && <p className="text-[12px] text-live">{err}</p>}
      <button type="submit" disabled={busy || !token} className="btn-dark disabled:opacity-50">
        {busy ? "Kontrol ediliyor…" : "Giriş"}
      </button>
    </form>
  );
}

function AppRow({
  app,
  onAction,
}: {
  app: QueueApp;
  onAction: (slug: string, status: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const act = async (status: string) => {
    setPending(true);
    try {
      await onAction(app.slug, status);
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[app.status]}`}
            >
              {STATUS_LABEL[app.status]}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted">
              {app.category_label}
            </span>
          </div>
          <h3 className="mt-1.5 text-[15px] font-bold text-ink dark:text-d-ink">{app.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-2 dark:text-d-ink-2">{app.tagline}</p>
        </div>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-ink-2 hover:text-accent dark:text-d-ink-2"
        >
          {new URL(app.url).hostname.replace(/^www\./, "")} <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {app.description && (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-2 dark:text-d-ink-2">
          {app.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted">
        <span>Geliştirici: {app.author_name}</span>
        {app.repo_url && (
          <a href={app.repo_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            Kaynak kod ↗
          </a>
        )}
        {app.submitter_email && <span>{app.submitter_email}</span>}
        <span>{fmtDate(app.created_at)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {app.status !== "approved" && (
          <button
            onClick={() => act("approved")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Onayla
          </button>
        )}
        {app.status !== "rejected" && (
          <button
            onClick={() => act("rejected")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:border-live hover:text-live disabled:opacity-50 dark:border-d-line dark:text-d-ink-2"
          >
            <X className="h-3.5 w-3.5" /> Reddet
          </button>
        )}
        {app.status !== "pending" && (
          <button
            onClick={() => act("pending")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:text-ink disabled:opacity-50 dark:border-d-line dark:text-d-ink-2"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Beklemeye al
          </button>
        )}
      </div>
    </li>
  );
}

export function AdminPanel({ authed, apps }: { authed: boolean; apps: QueueApp[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (!authed) return <LoginForm />;

  async function onAction(slug: string, status: string) {
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, status }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const pending = apps.filter((a) => a.status === "pending");
  const decided = apps.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-2 dark:text-d-ink-2">
          <span className="font-bold text-ink dark:text-d-ink">{pending.length}</span> bekleyen
          başvuru
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink dark:text-d-ink-2"
        >
          <LogOut className="h-3.5 w-3.5" /> Çıkış
        </button>
      </div>

      <section>
        <h2 className="sec-title mb-4">Bekleyen başvurular</h2>
        {pending.length === 0 ? (
          <p className="text-[13px] text-muted">Bekleyen başvuru yok.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
              <AppRow key={a.slug} app={a} onAction={onAction} />
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="sec-title mb-4">Karar verilenler</h2>
          <ul className="space-y-3">
            {decided.map((a) => (
              <AppRow key={a.slug} app={a} onAction={onAction} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
