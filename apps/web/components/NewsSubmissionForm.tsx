"use client";

import { useRef, useState } from "react";
import {
  AlignLeft,
  CheckCircle2,
  Image as ImageIcon,
  Mail,
  Phone,
  Send,
  Tag,
  User,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

const BUCKETS: Record<string, { tr: string; en: string }> = {
  AI: { tr: "Yapay Zekâ", en: "AI" },
  Robotics: { tr: "Robotik", en: "Robotics" },
  Coding: { tr: "Kodlama", en: "Coding" },
  Security: { tr: "Güvenlik", en: "Security" },
  Regulation: { tr: "Regülasyon", en: "Regulation" },
  Research: { tr: "Araştırma", en: "Research" },
  Infra: { tr: "Altyapı", en: "Infrastructure" },
  OpenSource: { tr: "Açık Kaynak", en: "Open Source" },
};

const MAX_PHOTOS = 5;
const MAX_BYTES = 4 * 1024 * 1024;

function Field({
  label,
  icon: Icon,
  required,
  children,
  full,
  hint,
}: {
  label: string;
  icon: typeof User;
  required?: boolean;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink dark:text-d-ink">
        <Icon className="h-3.5 w-3.5 text-muted" />
        {label}
        {required && <span className="text-live">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function NewsSubmissionForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { submitted: string; send: string; sending: string };
}) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const tr = locale === "tr";
  const L = (a: string, b: string) => (tr ? a : b);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES) {
        setState("error");
        setMsg(L("Her fotoğraf en fazla 4 MB olabilir.", "Each photo must be under 4 MB."));
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos(next);
  }

  function removePhoto(i: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[i].preview);
      copy.splice(i, 1);
      return copy;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const description = String(fd.get("description") ?? "").trim();
    const submitter_name = String(fd.get("submitter_name") ?? "").trim();
    if (description.length < 40) {
      setState("error");
      setMsg(L("Haber metni en az 40 karakter olmalı.", "News text must be at least 40 characters."));
      return;
    }
    if (submitter_name.length < 2) {
      setState("error");
      setMsg(L("Lütfen adınızı yazın.", "Please enter your name."));
      return;
    }

    setState("sending");
    setMsg("");
    try {
      const image_urls: string[] = [];
      for (const p of photos) {
        const up = new FormData();
        up.append("file", p.file);
        const res = await fetch("/api/haber-giris/upload", { method: "POST", body: up });
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b.detail ?? L("Fotoğraf yüklenemedi", "Upload failed"));
        }
        const data = (await res.json()) as { url: string };
        image_urls.push(data.url);
      }

      const payload = {
        description,
        category: String(fd.get("category") ?? ""),
        submitter_name,
        submitter_email: String(fd.get("submitter_email") ?? "").trim() || undefined,
        submitter_phone: String(fd.get("submitter_phone") ?? "").trim() || undefined,
        image_urls,
      };

      const res = await fetch("/api/haber-giris", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ? JSON.stringify(b.detail) : `HTTP ${res.status}`);
      }
      setState("ok");
      form.reset();
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : L("Bir hata oluştu", "Something went wrong"));
    }
  }

  return (
    <div className="rounded-[22px] border border-line bg-paper p-6 shadow-soft sm:p-8 dark:border-d-line dark:bg-d-paper">
      {state === "ok" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="max-w-sm text-[14px] text-ink-2 dark:text-d-ink-2">{labels.submitted}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field
            label={L("Haber metni", "News text")}
            icon={AlignLeft}
            required
            full
            hint={L("Ne olduğunu kendi cümlelerinle anlat.", "Tell the story in your own words.")}
          >
            <textarea
              name="description"
              required
              minLength={40}
              maxLength={8000}
              rows={8}
              placeholder={L("Haberi buraya yazın…", "Write the news here…")}
              className="field resize-y min-h-[160px]"
            />
          </Field>

          <Field label={L("Kategori", "Category")} icon={Tag} required full>
            <select name="category" required defaultValue="" className="field">
              <option value="" disabled>
                {L("Seçiniz", "Select")}
              </option>
              {Object.entries(BUCKETS).map(([b, label]) => (
                <option key={b} value={b}>
                  {label[locale]}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink dark:text-d-ink">
              <ImageIcon className="h-3.5 w-3.5 text-muted" />
              {L("Fotoğraflar", "Photos")}
              <span className="font-normal text-muted">
                ({L(`en fazla ${MAX_PHOTOS}`, `max ${MAX_PHOTOS}`)})
              </span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div
                  key={p.preview}
                  className="relative h-24 w-24 overflow-hidden rounded-xl border border-line dark:border-d-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white"
                    aria-label={L("Kaldır", "Remove")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-line text-[12px] font-medium text-muted transition hover:border-accent hover:text-accent dark:border-d-line"
                >
                  + {L("Ekle", "Add")}
                </button>
              )}
            </div>
          </div>

          <Field label={L("Adın", "Your name")} icon={User} required>
            <input
              name="submitter_name"
              required
              minLength={2}
              maxLength={120}
              placeholder={L("Adınız soyadınız", "Your full name")}
              className="field"
            />
          </Field>
          <Field label={L("E-posta (opsiyonel)", "Email (optional)")} icon={Mail}>
            <input name="submitter_email" type="email" placeholder="ornek@mail.com" className="field" />
          </Field>
          <Field label={L("Telefon (opsiyonel)", "Phone (optional)")} icon={Phone} full>
            <input
              name="submitter_phone"
              type="tel"
              maxLength={40}
              placeholder={L("05xx xxx xx xx", "+90…")}
              className="field"
            />
          </Field>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-ink"
            >
              <Send className="h-4 w-4" />
              {state === "sending" ? labels.sending : labels.send}
            </button>
            {state === "error" && <p className="mt-2 text-[12px] text-live">{msg}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
