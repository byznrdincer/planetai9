# 04 — Backend API (FastAPI)

Base: `/api/v1` · JSON · public read (MVP, auth yok) · Redis cache · sayfalama `?cursor=&limit=`.

Ortak zarf:
```json
{ "data": ..., "meta": { "next_cursor": "…", "count": 20 } }
```

## Home

### `GET /home`
Tek çağrıda ana sayfa. Cache 60 sn.
```json
{
  "top_signals":  [Event],          // is_top_signal, importance desc, ~5
  "latest_news":  [EventCard],       // last_activity_at desc, ~20
  "trending":     [TopicTrend],      // son 24h snapshot, rank<=12
  "videos":       [VideoCard],       // published_at desc, ~8
  "timeline":     [TimelineItem]     // son 24h, saat etiketli
}
```

## Events / News

### `GET /events`
Query: `category`, `entity` (slug), `source` (slug), `importance_min`, `impact`, `since`, `sort` (`recent`|`importance`), `cursor`, `limit`.
→ `[EventCard]`

### `GET /events/{slug}`
```json
{
  "event": Event,
  "sources": [ { "source": Source, "article": Article, "is_primary": bool } ],
  "entities": [ { "entity": Entity, "role": "primary|mentioned" } ],
  "topics": [Topic],
  "importance_factors": ImportanceFactors,
  "related_events": [EventCard],     // ortak entity/topic, ~6
  "related_videos": [VideoCard]
}
```

### `GET /news` → `GET /events` alias'ı (kategori sabitleriyle); frontend `/news` route'u için.

## Search

### `GET /search?q=`
Postgres FTS + trigram. Gruplu sonuç:
```json
{
  "query": "claude",
  "entities": { "models":[Entity], "companies":[Entity], "tools":[Entity] },
  "events":   { "count": 23, "items": [EventCard] },
  "videos":   { "count": 8,  "items": [VideoCard] },
  "research":  { "count": 14, "items": [EventCard] }   // category=Research
}
```
### `GET /search/suggest?q=` — hızlı autocomplete (entity adları + topic'ler).

## Trends

### `GET /trends?window=24h|7d` → `[TopicTrend]` (rank, delta_pct, event_count, sample_events)
### `GET /trends/{topic_slug}` → topic detay + zaman serisi (`[{captured_at, weighted_score}]`) + son event'ler.

## Videos

### `GET /videos?playlist=&topic=&cursor=` → `[VideoCard]`
### `GET /videos/{youtube_id}` → video + `related_events` + `related_entities` + `related_topics`.

## Entities (MVP'de minimal, V2'de genişler)

### `GET /entities/{slug}`
```json
{
  "entity": Entity,
  "relations": [ { "relation": "develops", "entity": Entity, "direction": "out|in" } ],
  "latest_events": [EventCard],
  "videos": [VideoCard],
  "timeline": [ { "date": "...", "title": "...", "event_slug": "..." } ]
}
```
Company/Model/Tool sayfaları bunun view'ları (V2'de `/models/{slug}`, `/companies/{slug}` özel alanlarla).

## Meta

### `GET /sources` → aktif kaynaklar + `source_type` + `trust_weight` (şeffaflık sayfası).
### `GET /categories` → sabit liste + her kategoride son 24h event sayısı.
### `GET /healthz` → db/redis/ingest son çalışma zamanı.

## Response şemaları (özet)

**EventCard:** `slug, title, summary, category, impact, importance, source_count, primary_entity{name,slug,type}, top_source{name,type}, published_at, image_url`

**Event:** EventCard + `why_it_matters, first_seen_at, last_activity_at, topics[]`

**TopicTrend:** `topic{name,slug}, window, rank, event_count, weighted_score, delta_pct, sample_events[EventCard]`

**VideoCard:** `youtube_id, title, description, thumbnail_url, duration_sec, published_at, playlist, topics[]`

**Source:** `name, slug, homepage_url, source_type, trust_weight`

**ImportanceFactors:** `source_reliability, independent_sources, entity_impact, novelty, market_impact, velocity, total`

## Notlar

- Tüm response modelleri Pydantic → `openapi.json` → `apps/web` için `openapi-typescript` ile TS tipleri.
- Cache invalidation: ingest turu sonunda `home`, `news:*`, `trending`, ilgili `events/{slug}` anahtarları silinir.
- Rate limit: IP başına 60 req/dk (Redis token bucket).
- CORS: yalnızca `apps/web` origin'i. Frontend API'ye server-side eriştiği için tarayıcıdan doğrudan çağrı beklenmiyor.
