# 05 — Frontend (Next.js)

App Router · TypeScript · Server Components + ISR · Tailwind. API'ye yalnızca sunucu tarafından erişilir (`apps/web/lib/api.ts`, server-only); anahtar tarayıcıya gitmez.

## Route'lar

| Route | İçerik | Render |
|---|---|---|
| `/` | Home dashboard | ISR `revalidate: 60` |
| `/news` | Event listesi + filtreler | ISR 60, filtre değişince client fetch |
| `/news/[slug]` | Event detay (kaynaklar, why it matters, related) | ISR 120 |
| `/videos` | Video grid + playlist sekmeleri | ISR 300 |
| `/videos/[id]` | Video + related news/entities/topics | ISR 300 |
| `/trends` | Trending topic listesi + mini grafikler | ISR 120 |
| `/trends/[slug]` | Topic detay + zaman serisi | ISR 120 |
| `/search?q=` | Gruplu global sonuçlar | dynamic |
| `/companies/[slug]` `/models/[slug]` `/tools/[slug]` | Entity view'ları | V2 (MVP'de `/entities/[slug]` generic) |
| `/radar` | AI Universe görselleştirmesi | V3 |
| `/sources` | Kaynak + trust şeffaflık sayfası | static |

## Home bileşen ağacı

```
<HomeHero>            "Explore the AI Universe" · "What's happening in AI right now?"
<TopSignals>          1 büyük featured + 2-4 kart · her biri: kategori, impact rozeti, kaynak
<section grid>
  <LatestNewsColumn>  EventCard listesi · sonsuz kaydırma
  <TrendingSidebar>   #Topic ↑NN% · TopicTrend
<PlanetVideos>        yatay kaydırmalı VideoCard'lar (dış link hissi YOK — kendi player sayfası)
<AiTimeline>          saat etiketli dikey liste · son 24h
<ExploreThePlanet>    Models · Companies · Tools · Research · Trends kartları (entity graph'e kapı)
```

## Ana bileşenler

- **`EventCard`** — başlık, `clean_summary`, kategori chip, impact rozeti (renk kodlu), `ImportanceDot` (0-10 → renk), `"Covered by N sources"`, primary entity linki, göreli zaman.
- **`SourceBadgeList`** — kaynak rozetleri; `primary` olan altı çizili + "Primary" etiketli.
- **`WhyItMatters`** — MVP'de `why_it_matters` null ise render edilmez (boşluk bırakmaz).
- **`ImportanceMeter`** — event detayda `importance_factors`'ı bar olarak gösterir ("neden bu skor").
- **`TopicTrendRow`** — `#AI Agents` + `↑ 84%` (yeşil) / `↓` (kırmızı) + sparkline.
- **`VideoCard` / `VideoPlayer`** — thumbnail, süre rozeti, YouTube embed (privacy-enhanced `youtube-nocookie`), altında related paneller.
- **`RelatedPanel`** — "Related to this: [entity] [entity] [event] [video]" chip listesi.
- **`GlobalSearch`** — ⌘K komut paleti; `/search/suggest` ile canlı; Enter → `/search`.
- **`FilterBar`** — Time / Category / Company / Source / Importance; URL query state.

## Tasarım sistemi (dark-first)

Token'lar (`styles/tokens.css`), tema-duyarlı (bkz. artifact/dark kuralları benzeri yaklaşım — burada tek tema: dark, opsiyonel light V2):

```
--bg            #070B14   (deep space)
--surface       #0E1524
--surface-2     #16203A   (glass card)
--border        #243049
--text          #E8ECF5
--text-dim      #93A0BC
--accent        #5B8CFF   (orbit blue)
--accent-2      #9C6BFF   (nebula violet)
--pos           #3FCF8E   (trend up)
--neg           #FF6B6B
impact: low #93A0BC · medium #5B8CFF · high #FFB020 · critical #FF6B6B
```

Görsel dil: soft/glass kartlar, ince gradient, hafif yıldız/grid arka plan dokusu, modern sans (Inter / Geist). **Gaming değil** — sakin, veri-odaklı. Referans his: Bloomberg + modern AI product + space interface.

Erişilebilirlik: renk tek başına anlam taşımaz (impact rozeti + metin), kontrast AA, `prefers-reduced-motion` → orbit animasyonları durur.

## Veri akışı

```
Server Component → lib/api.ts (fetch + Next cache tag) → FastAPI /api/v1/*
Filtre etkileşimi → client component → /api/v1 proxy route (app/api/*) → FastAPI
```

`revalidateTag('home')` ingest webhook'u ile tetiklenebilir (V2); MVP'de zaman bazlı ISR yeterli.

## Radar (V3) — kısa not

`/radar`: entity graph'ten force-directed / orbital layout (d3-force veya react-force-graph). Merkez = seçili entity; halkalar = ilişki tipleri; düğüm boyutu = son 7g event ağırlığı. Tıkla → entity sayfası. Veri: `GET /entities/{slug}` + graph komşuluk endpoint'i.
