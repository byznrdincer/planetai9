# PlanetAI

**Explore the AI Universe.** — AI dünyasındaki her sinyali tek bir platformda toplayan, filtreleyen, kategorize eden ve ilişkilendiren AI intelligence platformu.

> ONE PLANET. EVERY AI SIGNAL.

## Bu repo şu an ne içeriyor?

İlk teslimat: **ürün mimarisi + veri modeli + pipeline tasarımı** (kod değil, tasarım dokümanları).

| Doküman | İçerik |
|---|---|
| [docs/00-overview.md](docs/00-overview.md) | Ürün vizyonu, kapsam, MVP kararı, temel prensipler |
| [docs/01-architecture.md](docs/01-architecture.md) | Sistem mimarisi, servisler, teknoloji yığını, repo yapısı |
| [docs/02-data-model.md](docs/02-data-model.md) | Entity modeli, Postgres şeması, entity graph |
| [docs/03-ingestion-pipeline.md](docs/03-ingestion-pipeline.md) | Kaynak toplama, extraction, deduplication, scoring, trend engine (LLM'siz) |
| [docs/04-api.md](docs/04-api.md) | Backend REST API sözleşmesi |
| [docs/05-frontend.md](docs/05-frontend.md) | Next.js sayfa yapısı, route'lar, bileşenler |
| [docs/06-roadmap.md](docs/06-roadmap.md) | MVP → V2 → V3 → V4 yol haritası |

## Kararlaştırılan teknoloji yığını

- **Frontend:** Next.js (App Router, TypeScript), dark-first tasarım
- **Backend API:** Python + FastAPI
- **Ingestion / pipeline:** Python worker'ları (APScheduler / Celery beat)
- **Veritabanı:** PostgreSQL (+ `pg_trgm`, `pgvector` opsiyonel), full-text search için `tsvector`
- **Cache / kuyruk:** Redis
- **LLM:** MVP'de **yok**. İçerik kaynaktan olduğu gibi çekilir; sınıflandırma/skorlama kural tabanlıdır. AI işleme katmanı V2+ için pipeline'da ayrı bir adım olarak tasarlandı.

## Monorepo yapısı (hedef)

```
planetai/
├── apps/
│   ├── web/            # Next.js frontend
│   └── api/            # FastAPI backend
├── services/
│   └── ingest/         # kaynak toplayıcılar + pipeline
├── packages/
│   └── shared/         # ortak şema tipleri (pydantic + zod üretimi)
├── infra/              # docker-compose, migrations, seed
└── docs/
```
