import { NextResponse } from "next/server";
import { authorFetch, authorKey } from "@/lib/author";

const STATUSES = new Set(["pending", "approved", "rejected"]);

/** Moderator author changes a marketplace submission's status. */
export async function POST(req: Request) {
  const key = await authorKey();
  if (!key) return NextResponse.json({ ok: false }, { status: 401 });

  let slug = "";
  let status = "";
  try {
    const b = await req.json();
    slug = String(b.slug ?? "");
    status = String(b.status ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!slug || !STATUSES.has(status)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const res = await authorFetch(`/marketplace/${encodeURIComponent(slug)}/status`, key, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, detail: "API'ye ulaşılamadı" }, { status: 502 });
  }
}
