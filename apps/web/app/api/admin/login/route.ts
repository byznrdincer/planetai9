import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminFetch } from "@/lib/admin";

export async function POST(req: Request) {
  let token = "";
  try {
    token = String((await req.json()).token ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });

  let res: Response;
  try {
    res = await adminFetch("/marketplace/queue", token);
  } catch {
    return NextResponse.json({ ok: false, detail: "API'ye ulaşılamadı" }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ ok: false, detail: "Anahtar hatalı" }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set(ADMIN_COOKIE, token, {
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
  out.cookies.delete(ADMIN_COOKIE);
  return out;
}
