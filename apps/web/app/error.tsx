"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-xl font-black tracking-tight text-ink dark:text-d-ink">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-2 text-sm text-ink-2 dark:text-d-ink-2">
        Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="btn-dark">
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold text-ink dark:border-d-line dark:text-d-ink"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
