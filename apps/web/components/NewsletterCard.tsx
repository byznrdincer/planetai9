"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Newspaper, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function NewsletterCard({ locale }: { locale: Locale }) {
  const tr = locale === "tr";
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale, source: "home" }),
      });
      setState(res.ok ? "ok" : "error");
      if (res.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setState("error");
    }
  }

  const perks = [
    { icon: Newspaper, label: tr ? "Güncel Haberler" : "Latest News" },
    { icon: Sparkles, label: tr ? "Özel İçerikler" : "Exclusive Content" },
    { icon: CalendarDays, label: tr ? "Haftalık Özet" : "Weekly Digest" },
  ];

  return (
    <div className="card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-soft to-transparent dark:from-accent/10" />
      <h3 className="relative text-[17px] font-extrabold leading-snug tracking-tight3 text-ink dark:text-d-ink">
        {tr ? "En yeni gelişmelerden haberdar ol" : "Stay ahead of AI"}
      </h3>
      <p className="relative mt-2 text-[13px] leading-relaxed text-ink-2 dark:text-d-ink-2">
        {tr
          ? "Yapay zekâ dünyasındaki son gelişmeleri kaçırmamak için bültenimize abone ol."
          : "Subscribe to our newsletter and never miss what matters in AI."}
      </p>

      {state === "ok" ? (
        <p className="relative mt-4 rounded-xl bg-success/10 px-3 py-2.5 text-[13px] font-medium text-success">
          {tr ? "Teşekkürler! Aboneliğin alındı." : "Thanks! You're subscribed."}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="relative mt-4 space-y-2.5">
          <input
            name="email"
            type="email"
            required
            placeholder={tr ? "E-posta adresiniz" : "Your email"}
            className="field"
          />
          <button type="submit" disabled={state === "sending"} className="btn-dark w-full justify-center">
            {state === "sending"
              ? tr
                ? "Gönderiliyor…"
                : "Sending…"
              : tr
                ? "Abone ol"
                : "Subscribe"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
          {state === "error" && (
            <p className="text-[12px] text-live">
              {tr ? "Bir hata oluştu, tekrar deneyin." : "Something went wrong."}
            </p>
          )}
        </form>
      )}

      <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 dark:border-d-line">
        {perks.map((p) => (
          <div key={p.label} className="flex flex-col items-center gap-1.5 text-center">
            <p.icon className="h-4 w-4 text-ink-2 dark:text-d-ink-2" strokeWidth={1.8} />
            <span className="text-[11px] font-medium leading-tight text-ink-2 dark:text-d-ink-2">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
