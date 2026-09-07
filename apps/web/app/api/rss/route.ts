const BASE = process.env.PLANETAI_API_URL ?? "http://localhost:8077";
const SITE = process.env.PLANETAI_SITE_URL ?? "https://planetai9.com";

type EventCard = {
  slug: string;
  title: string;
  summary: string | null;
  published_at: string;
  top_source?: { name: string } | null;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const revalidate = 300;

export async function GET() {
  let items: EventCard[] = [];
  try {
    const res = await fetch(`${BASE}/api/v1/events?limit=30`, { next: { revalidate: 300 } });
    const data = await res.json();
    items = data.data ?? [];
  } catch {
    /* empty feed on error */
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>PlanetAI9 — Yapay Zekâ Haberleri</title>
<link>${SITE}</link>
<description>Yapay zekâ dünyasındaki gelişmeler.</description>
<language>tr</language>
${items
  .map(
    (e) => `<item>
<title>${esc(e.title)}</title>
<link>${SITE}/news/${e.slug}</link>
<guid>${SITE}/news/${e.slug}</guid>
<pubDate>${new Date(e.published_at).toUTCString()}</pubDate>
${e.summary ? `<description>${esc(e.summary)}</description>` : ""}
${e.top_source?.name ? `<source url="${SITE}">${esc(e.top_source.name)}</source>` : ""}
</item>`,
  )
  .join("\n")}
</channel></rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
