// Client-side XSLT so opening /rss.xml in a browser shows a readable page
// instead of raw XML. Feed readers ignore the stylesheet.

const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/rss/channel">
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title><xsl:value-of select="title"/></title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         color: #111827; background: #fafafa; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }
  .banner { font-size: 12px; background: #eff4ff; color: #1d4ed8; border: 1px solid #dbe6ff;
            border-radius: 12px; padding: 10px 14px; margin-bottom: 28px; }
  h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px; }
  .lead { color: #6b7280; margin: 0 0 8px; }
  .url { font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 32px; }
  .item { padding: 18px 0; border-top: 1px solid #e8e8e8; }
  .item a { color: #111827; text-decoration: none; font-weight: 700; font-size: 17px; letter-spacing: -0.01em; }
  .item a:hover { color: #2563eb; }
  .date { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  .desc { color: #6b7280; margin-top: 6px; font-size: 14px; }
  @media (prefers-color-scheme: dark) {
    body { color: #f5f5f6; background: #0b0b0c; }
    .banner { background: rgba(37,99,235,0.15); color: #93c5fd; border-color: rgba(37,99,235,0.3); }
    .item { border-color: #1f1f22; }
    .item a { color: #f5f5f6; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="banner">📡 Bu bir RSS akışıdır. Bağlantıyı favori haber okuyucuna ekleyerek PlanetAI9'u takip edebilirsin.</div>
  <h1><xsl:value-of select="title"/></h1>
  <p class="lead"><xsl:value-of select="description"/></p>
  <p class="url"><xsl:value-of select="atom:link/@href"/></p>
  <xsl:for-each select="item">
    <div class="item">
      <a href="{link}"><xsl:value-of select="title"/></a>
      <div class="date"><xsl:value-of select="pubDate"/></div>
      <div class="desc"><xsl:value-of select="description"/></div>
    </div>
  </xsl:for-each>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>`;

export const dynamic = "force-static";

export function GET() {
  return new Response(XSL, {
    headers: {
      "content-type": "text/xsl; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
