import { cookies } from "next/headers";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "planetai_locale";

export async function getLocale(): Promise<Locale> {
  try {
    const v = (await cookies()).get(LOCALE_COOKIE)?.value;
    return v === "en" ? "en" : "tr";
  } catch {
    return DEFAULT_LOCALE;
  }
}

const tr = {
  tagline: "Yapay Zekâ Haberleri",
  live: "Canlı Yayın",
  searchPlaceholder: "Haberlerde ara…",
  nav: {
    home: "Ana Sayfa",
    news: "Gündem",
    analysis: "Analiz",
    robotics: "Robotik",
    coding: "Kodlama",
    safety: "Güvenlik",
    regulation: "Regülasyon",
    video: "Video",
    marketplace: "AI Marketplace",
    authors: "Yazarlar",
    about: "Biz Kimiz",
  },
  section: {
    latest: "Son Haberler",
    mostRead: "En Çok Okunan",
    trends: "Trendler",
    fromAuthors: "Yazarlardan",
    breaking: "Son Dakika",
    video: "PlanetAI9 Video",
    marketplaceStrip: "AI Marketplace — Topluluğun Araçları",
    related: "İlgili Haberler",
  },
  common: {
    seeAll: "Tümünü gör →",
    all: "Tümü",
    latestSort: "En yeni",
    importanceSort: "Önem sırası",
    sourceCount: "kaynak",
    noNews: "Henüz haber yok.",
    quiet: "Sakin.",
    noData: "Veri yok.",
    backHome: "Ana sayfaya dön →",
    notFound: "Sayfa bulunamadı",
    notFoundBody: "Aradığınız haber kaldırılmış veya taşınmış olabilir.",
    footer: "PlanetAI9 — Tek Gezegen. Her Yapay Zekâ Sinyali.",
    sourcesLink: "Kaynaklar & Güven",
  },
  home: {},
  marketplace: {
    title: "AI Marketplace",
    lead: "Topluluğun geliştirdiği faydalı yapay zekâ uygulamaları — MCP sunucuları, LLM'ler, STT/TTS araçları, ajanlar. Kendi projeni de paylaşabilirsin.",
    suggest: "+ Uygulamanı öner",
    suggestTitle: "Uygulamanı öner",
    suggestBody:
      "Yaptığın yapay zekâ uygulamasını PlanetAI9 topluluğuyla paylaş. Gönderiler incelendikten sonra yayınlanır.",
    empty: "Bu kategoride henüz uygulama yok.",
    submitted: "Teşekkürler! Uygulaman inceleme kuyruğuna alındı.",
    send: "Gönder",
    sending: "Gönderiliyor…",
    source: "kaynak ↗",
  },
  authors: {
    title: "Yazarlar",
    lead: "PlanetAI9 köşe yazıları — sektörün kırılma noktaları ve Türkiye'nin yapay zekâ ekosistemi.",
    soon: "Köşe yazıları çok yakında yayında.",
    listLabel: "Yazarlar",
    noPosts: "Henüz köşe yazısı yok.",
    kicker: "Köşe Yazısı",
    allColumns: "← Tüm köşe yazıları",
  },
  event: {
    coveredBy: (n: number) => `${n} kaynak işledi`,
    primary: "Birincil",
    whyMatters: "Neden önemli?",
    score: "Önem puanı",
    relatedVideos: "İlgili PlanetAI9 videoları",
    factors: {
      source_reliability: "Kaynak güvenilirliği",
      independent_sources: "Bağımsız kaynak sayısı",
      entity_impact: "Aktör etkisi",
      novelty: "Yenilik",
      market_impact: "Pazar etkisi",
      velocity: "Yayılma hızı",
    } as Record<string, string>,
  },
  sources: {
    title: "Kaynaklar & Güven",
    lead: "PlanetAI9'daki her haber orijinal yayıncıya bağlanır. Güven ağırlığı, haberin önem puanını etkiler.",
    trust: "güven",
  },
  impact: { low: "düşük etki", medium: "orta etki", high: "yüksek etki", critical: "kritik" } as Record<string, string>,
};

export type DictT = typeof tr;

const en: DictT = {
  tagline: "AI News",
  live: "Live",
  searchPlaceholder: "Search the news…",
  nav: {
    home: "Home",
    news: "News",
    analysis: "Analysis",
    robotics: "Robotics",
    coding: "Coding",
    safety: "Safety",
    regulation: "Regulation",
    video: "Video",
    marketplace: "AI Marketplace",
    authors: "Columnists",
    about: "About",
  },
  section: {
    latest: "Latest News",
    mostRead: "Most Read",
    trends: "Trends",
    fromAuthors: "From Our Columnists",
    breaking: "Breaking",
    video: "PlanetAI9 Video",
    marketplaceStrip: "AI Marketplace — Community Tools",
    related: "Related",
  },
  common: {
    seeAll: "See all →",
    all: "All",
    latestSort: "Newest",
    importanceSort: "By importance",
    sourceCount: "sources",
    noNews: "No news yet.",
    quiet: "Quiet.",
    noData: "No data.",
    backHome: "Back to home →",
    notFound: "Page not found",
    notFoundBody: "This story may have been removed or moved.",
    footer: "PlanetAI9 — One Planet. Every AI Signal.",
    sourcesLink: "Sources & Trust",
  },
  home: {},
  marketplace: {
    title: "AI Marketplace",
    lead: "Useful AI apps built by the community — MCP servers, LLMs, STT/TTS tools, agents. Share your own project too.",
    suggest: "+ Submit your app",
    suggestTitle: "Submit your app",
    suggestBody:
      "Share the AI app you built with the PlanetAI9 community. Submissions are published after review.",
    empty: "No apps in this category yet.",
    submitted: "Thanks! Your app is in the review queue.",
    send: "Submit",
    sending: "Sending…",
    source: "source ↗",
  },
  authors: {
    title: "Columnists",
    lead: "PlanetAI9 columns — inflection points in the industry and the AI ecosystem.",
    soon: "Columns coming very soon.",
    listLabel: "Columnists",
    noPosts: "No columns yet.",
    kicker: "Column",
    allColumns: "← All columns",
  },
  event: {
    coveredBy: (n: number) => `Covered by ${n} source${n === 1 ? "" : "s"}`,
    primary: "Primary",
    whyMatters: "Why it matters",
    score: "Importance score",
    relatedVideos: "Related PlanetAI9 videos",
    factors: {
      source_reliability: "Source reliability",
      independent_sources: "Independent sources",
      entity_impact: "Actor impact",
      novelty: "Novelty",
      market_impact: "Market impact",
      velocity: "Velocity",
    } as Record<string, string>,
  },
  sources: {
    title: "Sources & Trust",
    lead: "Every story on PlanetAI9 links back to its original publisher. Trust weight feeds the importance score.",
    trust: "trust",
  },
  impact: { low: "low impact", medium: "medium impact", high: "high impact", critical: "critical" },
};

const DICTS: Record<Locale, DictT> = { tr, en };

export async function getDict(): Promise<DictT> {
  return DICTS[await getLocale()];
}

export function dictFor(locale: Locale): DictT {
  return DICTS[locale];
}

// ---- category + impact labels -------------------------------------------------

const CATEGORY: Record<string, { tr: string; en: string }> = {
  Models: { tr: "Modeller", en: "Models" },
  Companies: { tr: "Şirketler", en: "Companies" },
  Research: { tr: "Araştırma", en: "Research" },
  Robotics: { tr: "Robotik", en: "Robotics" },
  Agents: { tr: "Yapay Zekâ Ajanları", en: "AI Agents" },
  AICoding: { tr: "Yazılım & Kodlama", en: "AI Coding" },
  GenerativeAI: { tr: "Üretken Yapay Zekâ", en: "Generative AI" },
  ComputerVision: { tr: "Bilgisayarlı Görü", en: "Computer Vision" },
  VoiceAI: { tr: "Ses Yapay Zekâsı", en: "Voice AI" },
  HealthcareAI: { tr: "Sağlıkta Yapay Zekâ", en: "Healthcare AI" },
  FinanceAI: { tr: "Finansta Yapay Zekâ", en: "Finance AI" },
  OpenSource: { tr: "Açık Kaynak", en: "Open Source" },
  AISafety: { tr: "Yapay Zekâ Güvenliği", en: "AI Safety" },
  Regulation: { tr: "Regülasyon", en: "Regulation" },
  Infrastructure: { tr: "Altyapı", en: "Infrastructure" },
};

export function categoryLabel(c: string, locale: Locale): string {
  return CATEGORY[c]?.[locale] ?? c;
}

export function impactLabel(i: string, locale: Locale): string {
  return DICTS[locale].impact[i] ?? i;
}
