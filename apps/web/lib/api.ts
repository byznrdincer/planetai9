import "server-only";
import { getLocale } from "./i18n";

const BASE = process.env.PLANETAI_API_URL ?? "http://localhost:8077";

export async function api<T>(
  path: string,
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  // Tell the API which language to serve (translated title/summary/body when the
  // story's origin language differs). Endpoints that don't translate ignore it.
  const locale = await getLocale();
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}/api/v1${path}${sep}lang=${locale}`, {
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`API ${path} -> ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function apiSafe<T>(path: string, fallback: T, opts?: Parameters<typeof api>[1]): Promise<T> {
  return api<T>(path, opts).catch((err) => {
    console.error(`[api] ${path}:`, err instanceof Error ? err.message : err);
    return fallback;
  });
}
