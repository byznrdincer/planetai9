import { NextResponse } from "next/server";
import { authorFetch, authorKey } from "@/lib/author";

type Body = {
  slug?: string;
  title?: string;
  dek?: string | null;
  body?: string;
  hero_image_url?: string | null;
  status?: string;
};

function payloadFrom(b: Body) {
  return {
    title: String(b.title ?? "").trim(),
    dek: b.dek ? String(b.dek).trim() : null,
    body: String(b.body ?? "").trim(),
    hero_image_url: b.hero_image_url ? String(b.hero_image_url).trim() : null,
    status: b.status === "published" ? "published" : "draft",
  };
}

/** Create a new column. */
export async function POST(req: Request) {
  const key = await authorKey();
  if (!key) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Body;
  const res = await authorFetch("/authors/me/columns", key, {
    method: "POST",
    body: JSON.stringify(payloadFrom(b)),
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}

/** Update an existing column (draft ⇄ published, edits). */
export async function PATCH(req: Request) {
  const key = await authorKey();
  if (!key) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Body;
  const slug = String(b.slug ?? "");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  const res = await authorFetch(`/authors/me/columns/${encodeURIComponent(slug)}`, key, {
    method: "PATCH",
    body: JSON.stringify(payloadFrom(b)),
  });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
