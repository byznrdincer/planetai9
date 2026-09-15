"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, LogOut, Pencil, RotateCcw, X } from "lucide-react";
import type { QueueApp, QueueSubmission } from "@/lib/types";

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

function NewsRow({
  item,
  onAction,
  onSave,
}: {
  item: QueueSubmission;
  onAction: (id: string, status: string) => Promise<void>;
  onSave: (id: string, patch: { title: string; description: string }) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");

  const act = async (status: string) => {
    setPending(true);
    try {
      await onAction(item.id, status);
    } finally {
      setPending(false);
    }
  };

  const save = async () => {
    setPending(true);
    try {
      await onSave(item.id, { title: title.trim(), description: description.trim() });
      setEditing(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[item.status]}`}
            >
              {STATUS_LABEL[item.status]}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted">{item.category}</span>
          </div>
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field mt-2"
            />
          ) : (
            <h3 className="mt-1.5 text-[15px] font-bold text-ink dark:text-d-ink">{item.title}</h3>
          )}
        </div>
        {item.event_slug && (
          <a
            href={`/news/${item.event_slug}`}
            className="inline-flex items-center gap-1 text-[12px] text-accent"
          >
            Haberi gör <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {editing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="field mt-3 resize-y"
        />
      ) : (
        item.description && (
          <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-2 dark:text-d-ink-2">
            {item.description}
          </p>
        )
      )}

      {(item.image_urls?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.image_urls!.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted">
        {item.submitter_name && <span>Gönderen: {item.submitter_name}</span>}
        {item.submitter_email && <span>{item.submitter_email}</span>}
        {item.submitter_phone && <span>{item.submitter_phone}</span>}
        <span>{fmtDate(item.created_at)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={pending || title.trim().length < 4 || description.trim().length < 40}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-ink"
            >
              Kaydet
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(item.title);
                setDescription(item.description ?? "");
              }}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold dark:border-d-line"
            >
              Vazgeç
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 dark:border-d-line dark:text-d-ink-2"
          >
            <Pencil className="h-3.5 w-3.5" /> Düzenle
          </button>
        )}
        {item.status !== "approved" && (
          <button
            onClick={() => act("approved")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Onayla & yayınla
          </button>
        )}
        {item.status !== "rejected" && (
          <button
            onClick={() => act("rejected")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:border-live hover:text-live disabled:opacity-50 dark:border-d-line dark:text-d-ink-2"
          >
            <X className="h-3.5 w-3.5" /> Reddet
          </button>
        )}
        {item.status !== "pending" && (
          <button
            onClick={() => act("pending")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-2 disabled:opacity-50 dark:border-d-line dark:text-d-ink-2"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Beklemeye al
          </button>
        )}
      </div>
    </li>
  );
}

export function AdminPanel({
  authed,
  apps,
  news,
}: {
  authed: boolean;
  apps: QueueApp[];
  news: QueueSubmission[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"news" | "marketplace">("news");

  if (!authed) return <LoginForm />;

  async function onAppAction(slug: string, status: string) {
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, status }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function onNewsAction(id: string, status: string) {
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function onNewsSave(id: string, patch: { title: string; description: string }) {
    const res = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const pendingApps = apps.filter((a) => a.status === "pending");
  const decidedApps = apps.filter((a) => a.status !== "pending");
  const pendingNews = news.filter((n) => n.status === "pending");
  const decidedNews = news.filter((n) => n.status !== "pending");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-line dark:border-d-line">
          {(
            [
              ["news", "Haberler", pendingNews.length],
              ["marketplace", "Marketplace", pendingApps.length],
            ] as const
          ).map(([id, label, badge]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold ${
                tab === id
                  ? "border-ink text-ink dark:border-d-ink dark:text-d-ink"
                  : "border-transparent text-ink-2 dark:text-d-ink-2"
              }`}
            >
              {label}
              {badge > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 hover:text-ink dark:text-d-ink-2"
        >
          <LogOut className="h-3.5 w-3.5" /> Çıkış
        </button>
      </div>

      {tab === "news" ? (
        <>
          <section>
            <h2 className="sec-title mb-4">Bekleyen haberler</h2>
            {pendingNews.length === 0 ? (
              <p className="text-[13px] text-muted">Bekleyen haber yok.</p>
            ) : (
              <ul className="space-y-3">
                {pendingNews.map((n) => (
                  <NewsRow key={n.id} item={n} onAction={onNewsAction} onSave={onNewsSave} />
                ))}
              </ul>
            )}
          </section>
          {decidedNews.length > 0 && (
            <section>
              <h2 className="sec-title mb-4">Karar verilen haberler</h2>
              <ul className="space-y-3">
                {decidedNews.map((n) => (
                  <NewsRow key={n.id} item={n} onAction={onNewsAction} onSave={onNewsSave} />
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <>
          <section>
            <h2 className="sec-title mb-4">Bekleyen başvurular</h2>
            {pendingApps.length === 0 ? (
              <p className="text-[13px] text-muted">Bekleyen başvuru yok.</p>
            ) : (
              <ul className="space-y-3">
                {pendingApps.map((a) => (
                  <AppRow key={a.slug} app={a} onAction={onAppAction} />
                ))}
              </ul>
            )}
          </section>
          {decidedApps.length > 0 && (
            <section>
              <h2 className="sec-title mb-4">Karar verilenler</h2>
              <ul className="space-y-3">
                {decidedApps.map((a) => (
                  <AppRow key={a.slug} app={a} onAction={onAppAction} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
