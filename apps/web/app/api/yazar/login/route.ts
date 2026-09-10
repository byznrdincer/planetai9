import { NextResponse } from "next/server";
import { AUTHOR_COOKIE, authorFetch } from "@/lib/author";

export async function POST(req: Request) {
  let key = "";
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    const secret = String(body.secret ?? "").trim();
    if (!slug || !secret) throw new Error("missing");
    key = `${slug}:${secret}`;
  } catch {
    return NextResponse.json({ ok: false, detail: "Kullanıcı adı ve anahtar gerekli" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await authorFetch("/authors/me/studio", key);
  } catch {
    return NextResponse.json({ ok: false, detail: "API'ye ulaşılamadı" }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ ok: false, detail: "Kullanıcı adı veya anahtar hatalı" }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set(AUTHOR_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return out;
}

export async function DELETE() {
  const out = NextResponse.json({ ok: true });
  out.cookies.delete(AUTHOR_COOKIE);
  return out;
}
