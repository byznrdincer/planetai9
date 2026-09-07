import "server-only";

const BASE = process.env.PLANETAI_API_URL ?? "http://localhost:8077";

export async function api<T>(
  path: string,
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API ${path} -> ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function apiSafe<T>(path: string, fallback: T, opts?: Parameters<typeof api>[1]): Promise<T> {
  return api<T>(path, opts).catch((err) => {
    console.error(err);
    return fallback;
  });
}
