import { NextResponse } from "next/server";
import { adminFetch, adminToken } from "@/lib/admin";

export async function POST(req: Request) {
  const token = await adminToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  let slug = "";
  let status = "";
  try {
    const body = await req.json();
    slug = String(body.slug ?? "");
    status = String(body.status ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!slug || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const res = await adminFetch(`/marketplace/${encodeURIComponent(slug)}/status`, token, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, detail: "API'ye ulaşılamadı" }, { status: 502 });
  }
}
