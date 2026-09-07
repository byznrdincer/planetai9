# 03 — Ingestion Pipeline (LLM'siz)

```
Collectors → Extraction → Normalize → Dedup/Event → Classify → Entity tag
          → Importance score → Trend snapshot → DB
```

Her adım saf fonksiyon: girdi → çıktı, yan etki yok (DB yazımı en sonda tek yerde). Bu, adımların ayrı ayrı test edilmesini ve V2'de araya LLM adımı sokulmasını kolaylaştırır.

## 1. Collectors

`BaseCollector.fetch() -> list[RawItem]`

| Collector | Kaynak | Notlar |
|---|---|---|
| `RssCollector` | RSS/Atom (company blogs, TechCrunch, Verge, VentureBeat...) | `feedparser`; koşullu GET (ETag/Last-Modified); guid = external_id |
| `HtmlBlogCollector` | Feed'i olmayan bloglar | listeleme sayfası selector'ları; `trafilatura` ile içerik |
| `ArxivCollector` | arXiv API (`cs.AI`, `cs.CL`, `cs.LG`, `cs.CV`, `cs.RO`) | Atom API; external_id = arxiv id |
| `YouTubeCollector` | YouTube Data API v3 (PlanetAI kanalı) | `channels.list` → uploads playlist → `playlistItems` + `videos` (duration, views) |
| `NewsApiCollector` | Opsiyonel (NewsAPI / GDELT) — "AI" sorgusu | ikincil kapsama genişletmek için |

`RawItem`: `source_id, external_id, url, title, summary, published_at, author, image_url, lang, extra{}`

**Politeness:** kaynak başına `poll_interval_sec`, global concurrency limiti, `robots.txt`, User-Agent = `PlanetAIBot/0.1 (+https://planetai.example/bot)`.

## 2. Extraction & Normalize

- Boş/çok kısa başlıkları ele; HTML entity decode; whitespace normalize.
- `clean_summary`: feed açıklamasından HTML strip → ilk 1-2 cümle veya ≤280 karakter. Yoksa OG description → yoksa `body_excerpt`'in ilk cümlesi. **Yeniden yazma yok.**
- `body_excerpt`: yalnızca ilk ~500 karakter saklanır (telif; tam gövde yok).
- Dil tespiti (`langid`/`fasttext-lite`); MVP'de `en` dışını düşür (opsiyon).
- `content_hash = sha1(normalize(title) + registered_domain(url))`.
- `published_at` yoksa `fetched_at` kullan ama flag'le.

## 3. Deduplication → Event

Amaç: aynı gerçek-dünya olayını tek `event` altında toplamak.

Aday eşleşme (yeni article X için, son 72 saatteki article'lar):
1. **Tam URL / canonical eşitliği** → kesin aynı.
2. **Başlık trigram benzerliği** (`pg_trgm similarity >= 0.55`) **VE** zaman farkı ≤ 48h.
3. **SimHash Hamming mesafesi ≤ 4** (başlık + clean_summary token'ları üzerinden) **VE** ortak "anchor entity" (aynı şirket/model sözlükte eşleşiyor).
4. (V2) embedding cosine ≥ 0.82.

Eşleşme varsa X mevcut event'e bağlanır; yoksa yeni event oluşturulur.

Event güncelleme (yeni article bağlanınca):
- `source_count` = distinct source
- `last_activity_at` = max(published_at)
- temsil başlık/özet: birincil kaynak (`source_type in (primary, official_announcement)`) varsa ondan; yoksa en yüksek `trust_weight`.
- iki event yanlışlıkla ayrı oluşmuşsa `merge`: küçüğü `status=merged_into`, article'lar taşınır.

UI çıktısı: `"Covered by 8 sources"` + kaynak rozetleri, birincil kaynak en üstte ve "Primary source" etiketli.

## 4. Classification (kural motoru)

`category_rules.yaml`:
```yaml
- if_source: ["arxiv"]                      then: Research
- if_entity_type: ["model"]                 then: Models
- if_keywords: ["robot","humanoid","embodied"]  then: Robotics
- if_keywords: ["agent","agentic","tool use"]   then: Agents
- if_keywords: ["coding","code model","SWE-bench","IDE"] then: AICoding
- if_keywords: ["regulation","EU AI Act","executive order","ban"] then: Regulation
- if_keywords: ["GPU","datacenter","training cluster","inference chip"] then: Infrastructure
- if_keywords: ["safety","alignment","red team","jailbreak"] then: AISafety
- if_keywords: ["open weights","open-source","Apache 2.0","MIT license"] then: OpenSource
default: Companies
```
İlk eşleşen kazanır; sıralı değerlendirme. Skorlu varyant: her kural bir kategoriye ağırlık ekler, en yüksek toplam kazanır (daha sağlam). Kurallar event düzeyinde birleştirilmiş metin üzerinde çalışır.

## 5. Entity tagging (sözlük)

- `entities.yaml` → `name` + `aliases` → normalize edilmiş arama tablosu (case-insensitive, kelime sınırı).
- Aho-Corasick ile event metninde çoklu eşleşme.
- Rol ataması: başlıkta geçen + en spesifik (model > product > company) entity → `primary`; diğerleri `mentioned`.
- `primary_entity_id` event'e yazılır; yeni/bilinmeyen büyük harfli ürün adları "candidate entity" kuyruğuna (insan onayı) düşer.

## 6. Importance scoring

`importance = clamp(0..10, Σ wᵢ · factorᵢ)` — açıklanabilir, tunable.

| factor | 0..1 nasıl | ağırlık (başlangıç) |
|---|---|---|
| `source_reliability` | event'teki max `trust_weight` | 0.15 |
| `independent_sources` | `min(source_count,6)/6` | 0.22 |
| `entity_impact` | primary entity'nin "tier"ı (frontier lab / major model = 1.0; küçük = 0.3) | 0.20 |
| `novelty` | son 30 günde aynı primary entity + kategori kombinasyonu ne kadar seyrek | 0.12 |
| `market_impact` | anahtar kelime sinyali: "launch/release/raises/acquires/GA" + fiyat/benchmark | 0.15 |
| `velocity` | ilk 6 saatte kaç kaynak eklendi (hız) | 0.14 |

`impact` bandı: `<4 low · 4-6 medium · 7-8 high · ≥9 critical`.
`is_top_signal`: son 24h içinde `importance >= 7.5` olan ilk ~5 event (kategori çeşitliliği için kategori başına max 2).
`importance_factors` tablosuna bileşenler yazılır → UI "why this score".

## 7. Trend detection

Her 30 dk (veya ingest turu sonunda), her `window ∈ {24h, 7d}` için:
```
for topic in topics:
    events = events_in_window(topic, window)
    event_count   = len(events)
    weighted      = Σ event.importance
    prev_weighted = son bir önceki snapshot.weighted_score
    delta_pct     = (weighted - prev_weighted) / max(prev_weighted, ε) * 100
rank = sort by (weighted desc), tie-break event_count
```
`topic_trend_snapshots`'a yazılır. `Trending` UI: en son `24h` snapshot, `rank <= 12`, `#Topic  ↑NN%`.

Sosyal/arama sinyalleri (X, Google Trends) V3'te ek factor olarak eklenebilir; şema `weighted_score` formülünü değiştirmeden genişletmeye uygun.

## 8. DB yazımı

Tek transaction: `articles` upsert → event bağla/oluştur → `event_entities`, `event_topics` → `importance_factors`. Redis advisory lock ile aynı event'e paralel yazım engellenir. İş bitince ilgili API cache anahtarları invalidate edilir (`home`, `news:*`, `trending`).

## Zamanlama (MVP, APScheduler)

| iş | aralık |
|---|---|
| RSS/blog collectors | 10 dk |
| arXiv | 60 dk |
| YouTube | 60 dk |
| trend snapshot | 30 dk |
| top-signal yeniden seçimi | 15 dk |
| source seed senkronu | başlangıç + günlük |

## Test stratejisi

- Her pipeline adımı için fixture-based unit test (`tests/fixtures/*.json` ham feed örnekleri).
- Dedup için "gold set": elle işaretlenmiş 30-40 article → beklenen event kümeleri; precision/recall raporu.
- Scoring için snapshot testi: bilinen event'ler → beklenen bant.

## V2: AI processing adımı nereye giriyor?

`Classify` ile `Importance score` arasına opsiyonel `ai_enrich(event)` adımı:
- girdi: event başlık + kaynak özetleri + tespit edilen entity'ler
- çıktı: `summary` (daha iyi), `why_it_matters`, ek `topics`, entity doğrulama, `novelty`/`market_impact` için ikinci görüş
- feature flag `AI_ENRICH_ENABLED`; kapalıyken pipeline bugünkü gibi çalışır
- sağlayıcı-bağımsız arayüz: `Enricher.enrich(EventDraft) -> EventEnrichment`
