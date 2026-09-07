# 01 — Sistem Mimarisi

## Yüksek seviye

```
                       ┌─────────────────────────┐
                       │   External Sources      │
                       │  RSS · blogs · YouTube   │
                       │  arXiv · HF · news APIs   │
                       └────────────┬────────────┘
                                    │  (pull, zamanlanmış)
                       ┌────────────▼────────────┐
                       │  services/ingest         │
                       │  ────────────────────    │
                       │  1 Collectors            │
                       │  2 Article Extraction     │
                       │  3 Normalize              │
                       │  4 Duplicate → Event      │
                       │  5 Classification (rules) │
                       │  6 Entity tagging (dict)  │
                       │  7 Importance scoring     │
                       │  8 Trend detection        │
                       │  [9 AI processing]  ← V2  │
                       └────────────┬────────────┘
                                    │  yazar
                       ┌────────────▼────────────┐
                       │   PostgreSQL  +  Redis   │
                       └────────────┬────────────┘
                                    │  okur
                       ┌────────────▼────────────┐
                       │   apps/api (FastAPI)     │
                       │   REST + cache katmanı   │
                       └────────────┬────────────┘
                                    │  HTTP/JSON
                       ┌────────────▼────────────┐
                       │   apps/web (Next.js)     │
                       │   SSR/ISR dashboard      │
                       └─────────────────────────┘
```

**Üç bağımsız çalışan parça:** `ingest` (veri üretir), `api` (veriyi sunar), `web` (gösterir). Aralarındaki tek sözleşme: DB şeması ve REST API.

## Servisler

### services/ingest (Python)

- **Scheduler:** APScheduler (MVP) — kaynak başına cron aralığı. Ölçeklenince Celery + Redis broker.
- **Collector'lar:** kaynak tipi başına bir modül (`rss`, `youtube`, `arxiv`, `html_blog`, `news_api`). Ortak `BaseCollector` arayüzü: `fetch() -> list[RawItem]`.
- **Pipeline:** her `RawItem` sırayla adımlardan geçer (bkz. [03-ingestion-pipeline.md](03-ingestion-pipeline.md)). Adımlar saf fonksiyon; kolay test edilir.
- **Idempotent:** her ham öğe `source_id + external_id` ile tekilleştirilir; tekrar çalışmak veri bozmaz.
- **Rate limiting & politeness:** kaynak başına min interval, `robots.txt` saygısı, `ETag`/`Last-Modified` cache.

### apps/api (Python + FastAPI)

- Sadece **okuma** API'si (MVP). Yazma yalnızca ingest'ten DB'ye.
- Pydantic response modelleri = frontend tip sözleşmesi. `openapi.json`'dan TS tipleri üretilir.
- Redis cache: sık istenen listeler (home, trending) 30–120 sn TTL.
- Auth: MVP'de yok (public read). V3'te "Personalized Radar" için kullanıcı hesabı (JWT / session).

### apps/web (Next.js, App Router, TypeScript)

- Server Components + ISR: Home ve liste sayfaları `revalidate` ile önbelleklenir.
- API'ye yalnızca sunucu tarafından erişim (route handlers / server actions); tarayıcıya anahtar sızmaz.
- Tasarım sistemi: Tailwind + küçük bir token seti (bkz. [05-frontend.md](05-frontend.md)).

## Veri depoları

| Depo | Kullanım |
|---|---|
| PostgreSQL | Ana kalıcı veri: sources, articles, events, entities, relations, topics, trends, videos |
| Postgres FTS (`tsvector`) | Global search (MVP) |
| `pg_trgm` | Başlık benzerliği / fuzzy dedup |
| Redis | API cache, ingest kilitleri (advisory lock), rate limit sayaçları |
| `pgvector` (opsiyonel, V2) | Semantik dedup + "related" için embedding |
| Object storage (S3/R2) | Video thumbnail, tool logo cache (opsiyonel) |

## Ortamlar & dağıtım

- **Local:** `infra/docker-compose.yml` → postgres + redis + api + web + ingest.
- **Migrations:** Alembic (`infra/migrations`).
- **Seed:** `infra/seed/` — kaynak listesi (`sources.yaml`), bilinen entity sözlüğü (`entities.yaml`), kategori kuralları (`category_rules.yaml`).
- **Prod (öneri):** web → Vercel/Netlify; api + ingest + postgres + redis → tek VPS veya Fly.io/Railway. Ingest ayrı process/worker olarak.

## Repo yapısı

```
planetai/
├── apps/
│   ├── web/
│   │   ├── app/                # route'lar: /, /news, /videos, /search ...
│   │   ├── components/
│   │   ├── lib/                # api client (server-only)
│   │   └── styles/
│   └── api/
│       ├── planetai_api/
│       │   ├── main.py
│       │   ├── routers/        # news, events, home, search, trends, videos
│       │   ├── models/         # pydantic response şemaları
│       │   ├── db/             # sqlalchemy, session
│       │   └── cache.py
│       └── tests/
├── services/
│   └── ingest/
│       ├── planetai_ingest/
│       │   ├── collectors/     # rss.py, youtube.py, arxiv.py, html_blog.py
│       │   ├── pipeline/       # extract.py, dedup.py, classify.py, entities.py, score.py, trends.py
│       │   ├── scheduler.py
│       │   └── run.py
│       └── tests/
├── packages/
│   └── shared/                 # ortak enum/sabitler (kategoriler, source types, importance bantları)
├── infra/
│   ├── docker-compose.yml
│   ├── migrations/
│   └── seed/
└── docs/
```

## Neden bu ayrım?

- `ingest` çökerse site ayakta kalır (bayat veri > sıfır veri).
- LLM adımı V2'de sadece `ingest`'e eklenir; `api` ve `web` değişmez.
- Frontend'i değiştirmeden farklı bir API tüketicisi (mobil, Slack bot, Daily Brief üretici) eklenebilir.
