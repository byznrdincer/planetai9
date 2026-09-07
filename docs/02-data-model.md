# 02 — Veri Modeli

## Kavramsal model

```
Source ───< Article >─── Event(Story)
                 │            │
                 │            ├──< EventEntity >── Entity ──< EntityRelation >── Entity
                 │            ├──< EventTopic >──── Topic
                 │            └─── ImportanceScore
Video ───────────┴──< VideoLink >── (Event | Entity | Topic)
Topic ──< TopicTrendSnapshot >
```

Temel fikir: kullanıcının gördüğü birim **Event** (olay). Article ham girdidir, Event türetilmiş anlamlı birimdir. Her şey **Entity graph**'e bağlanır.

## Enum'lar (packages/shared)

```
Category        = All | Models | Companies | Research | Robotics | Agents | AICoding
                | GenerativeAI | ComputerVision | VoiceAI | HealthcareAI | FinanceAI
                | OpenSource | AISafety | Regulation | Infrastructure

SourceType      = primary | official_announcement | major_news | research_paper
                | community | social

EntityType      = company | model | product | tool | person | technology | institution

RelationType    = develops | owns | based_on | competes_with | powers
                | works_at | published_by | successor_of | integrates

Impact          = low | medium | high | critical
ImportanceBand  = 0-3 Low · 4-6 Medium · 7-8 High · 9-10 Critical
```

## Tablolar (PostgreSQL)

### sources
Kaydedilmiş dış kaynaklar (`infra/seed/sources.yaml`'dan senkronlanır).

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| name | text | "OpenAI Blog", "TechCrunch" |
| homepage_url | text | |
| feed_url | text null | RSS/Atom |
| kind | text | `rss` \| `youtube` \| `arxiv` \| `html_blog` \| `news_api` |
| source_type | text | `SourceType` — birincil mi ikincil mi |
| trust_weight | numeric(3,2) | 0..1, scoring'de kullanılır |
| entity_id | uuid null → entities.id | kaynak bir şirkete aitse (ör. OpenAI blog) |
| poll_interval_sec | int | |
| enabled | bool | |
| last_fetched_at | timestamptz null | |
| etag / last_modified | text null | koşullu GET |

### articles
Bir kaynaktan gelen tek bir ham içerik.

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| source_id | uuid → sources.id | |
| external_id | text | feed guid / video id / arxiv id |
| canonical_url | text | orijinal içerik linki |
| title | text | |
| author | text null | |
| raw_summary | text null | feed/OG açıklaması |
| clean_summary | text null | pipeline'ın ürettiği kısa özet |
| body_excerpt | text null | ilk ~500 karakter (tam gövde saklanmaz) |
| lang | text | |
| published_at | timestamptz | |
| fetched_at | timestamptz | |
| image_url | text null | |
| event_id | uuid null → events.id | dedup sonrası atanır |
| content_hash | text | normalize başlık+url hash, idempotency |
| dedup_simhash | bigint null | benzerlik için |

Kısıt: `unique (source_id, external_id)`.
İndeks: `gin (to_tsvector('english', title || ' ' || coalesce(clean_summary,'')))`, `gin (title gin_trgm_ops)`, `(published_at desc)`.

### events  (kullanıcıya gösterilen "story")

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| slug | text unique | url için |
| title | text | temsil eden başlık (birincil kaynak varsa ondan) |
| summary | text null | |
| why_it_matters | text null | MVP'de null |
| category | text | `Category` |
| primary_entity_id | uuid null → entities.id | "kim yaptı" |
| impact | text | `Impact` |
| importance | numeric(4,2) | 0..10 |
| source_count | int | kaç bağımsız kaynak işledi |
| first_seen_at | timestamptz | |
| last_activity_at | timestamptz | yeni kaynak geldikçe güncellenir |
| is_top_signal | bool | home "Top Signals" seçimi |
| status | text | `active` \| `merged_into`(→ event_id) \| `hidden` |

İndeks: `(last_activity_at desc)`, `(category, importance desc)`, `(is_top_signal, importance desc)`.

### entities
AI evrenindeki düğümler (şirket, model, ürün, araç, kişi, teknoloji).

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| type | text | `EntityType` |
| name | text | "Anthropic", "Claude Opus", "Claude Code" |
| slug | text unique | |
| aliases | text[] | eşleştirme için ("GPT-4o", "gpt4o") |
| parent_id | uuid null → entities.id | model → company kısayolu |
| description | text null | |
| metadata | jsonb | tipe göre serbest alan (bkz. aşağı) |
| logo_url | text null | |
| website_url | text null | |
| first_seen_at / updated_at | timestamptz | |

`metadata` örnekleri:
- **model:** `context_window`, `modalities[]`, `pricing`, `open_weights`(bool), `api_available`(bool), `latest_version`, `benchmarks{}`
- **tool:** `pricing`, `rating`, `planetai_score`, `tool_category`
- **company:** `founded`, `hq`, `funding_total`, `leadership[]`

### entity_relations
Yönlü kenar.

| kolon | tip |
|---|---|
| id | uuid pk |
| from_entity_id | uuid → entities.id |
| to_entity_id | uuid → entities.id |
| relation | text (`RelationType`) |
| since | date null |
| source_note | text null |

`unique (from_entity_id, to_entity_id, relation)`.
Örn: `Anthropic —develops→ Claude Opus`, `Claude Code —based_on→ Claude`, `Cursor —powers→ ... ` vs.

### event_entities  (olay ↔ entity, M:N)

| event_id | entity_id | role | confidence |
|---|---|---|---|
| uuid | uuid | `primary` \| `mentioned` | numeric 0..1 |

### topics  &  event_topics
`topics(id, name, slug, kind)` — `kind`: `hashtag` \| `theme`. Örn: `AI Agents`, `AI Coding`, `Multimodal`.
`event_topics(event_id, topic_id, weight)`.

### topic_trend_snapshots  (trend engine çıktısı)

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| topic_id | uuid → topics.id | |
| window | text | `24h` \| `7d` |
| captured_at | timestamptz | |
| event_count | int | pencere içindeki olay sayısı |
| weighted_score | numeric | importance ağırlıklı |
| delta_pct | numeric | önceki pencereye göre % değişim |
| rank | int | o snapshot'taki sıra |

`Trending` bölümü en son snapshot'tan `order by rank`.

### videos  (PlanetAI YouTube)

| kolon | tip | not |
|---|---|---|
| id | uuid pk | |
| youtube_id | text unique | |
| title / description | text | |
| thumbnail_url | text | |
| duration_sec | int | |
| published_at | timestamptz | |
| view_count | int null | |
| playlist | text null | Latest/Explainers/News/Model Reviews... |
| topics | text[] | video etiketleri |

### video_links  (video ↔ evren)

| video_id | target_type | target_id |
|---|---|---|
| uuid | `event` \| `entity` \| `topic` | uuid |

MVP'de bu bağlar başlık/açıklama içindeki entity sözlüğü eşleşmesiyle kurulur.

### importance_factors  (skorun açıklanabilirliği — opsiyonel ama önerilir)
Her event için skor bileşenlerini saklar: `event_id, source_reliability, independent_sources, entity_impact, novelty, market_impact, velocity, user_interest, computed_at`. UI'da "neden bu skor?" gösterimi ve tuning için.

## Entity graph — örnek

```
Anthropic (company)
 ├─ develops → Claude (technology/model-family)
 │              ├─ successor chain: Claude 3 → Claude 4 → Claude X
 │              └─ powers → Claude Code (product)
 ├─ develops → Claude Code (product)
 └─ competes_with → OpenAI, Google DeepMind

Event "Anthropic releases coding model"
 ├─ event_entities: Anthropic(primary), Claude(mentioned), Claude Code(mentioned)
 ├─ event_topics: AI Coding, Agents
 └─ video_links: PlanetAI "Claude Code hands-on"
```

Bu graph "Related to this video / event" ve Radar görselleştirmesinin veri temeli.

## Migrations & seed

- Alembic ile versiyonlu şema.
- Seed dosyaları insan-düzenlenebilir YAML; ingest başlangıçta DB'ye upsert eder:
  - `sources.yaml` — ~40-60 kaynak (company blogs, major outlets, arXiv cs.AI/cs.CL, HF, YouTube kanalı)
  - `entities.yaml` — bilinen şirketler + model aileleri + popüler araçlar + kişiler
  - `entity_relations.yaml`
  - `category_rules.yaml` — kaynak/anahtar kelime → kategori
  - `topics.yaml`
