# Deployment

PlanetAI9 is four moving parts:

| part | what it is | needs |
|---|---|---|
| `apps/web` | Next.js 15 (standalone) | Node 22, reach the API over HTTP |
| `apps/api` | FastAPI | Postgres 16, Redis |
| `services/ingest` | APScheduler collector loop | Postgres 16, Redis, outbound HTTP |
| infra | Postgres 16 (+`pg_trgm`), Redis 7 | a disk |

Two supported shapes: **self-host with Docker Compose** (everything on one box) or
**split** (web on Vercel, API + ingest + data on a container host).

---

## Option A — self-host (Docker Compose)

One VM with Docker. TLS is terminated by a reverse proxy you put in front of `web`.

```bash
cp infra/.env.prod.example infra/.env.prod
# edit infra/.env.prod — at minimum:
#   SITE_URL=https://planetai9.com
#   SITE_DOMAIN=planetai9.com               # host only, for the bundled Caddy
#   POSTGRES_PASSWORD=<long random>
#   ADMIN_TOKEN=<long random>               # /yonetim panel
#   AUTHOR_KEYS=ayhan-demirci:<long random> # /yazar studio (optional)
#   MODERATOR_AUTHORS=ayhan-demirci         # authors who may moderate marketplace
#   GOOGLE_TRANSLATE_API_KEY=<optional>     # TR<->EN translation, docs/07-translation.md
#   SENTRY_DSN=<optional>                   # error monitoring
#   YOUTUBE_API_KEY=<optional>

# bring your own reverse proxy:
make prod-up
# …or use the bundled Caddy (auto-HTTPS via Let's Encrypt, needs SITE_DOMAIN + DNS):
make prod-up-caddy
```

What comes up:

- `postgres` / `redis` — named volumes `pgdata`, `redisdata`
- `backup` — daily `pg_dump` into the `pgbackups` volume (gzip + retention). On-demand: `make prod-backup`.
- `backup-offsite` *(profile `offsite`)* — ships the `pgbackups` volume to S3/B2/R2/MinIO on a cron. Set `OFFSITE_S3_*` and run `make prod-up-full` (Caddy + offsite) or add `--profile offsite`.
- `api` — `alembic upgrade head` on start, then uvicorn on `:8000` (internal only). Docs disabled, CORS locked to `SITE_URL`. Healthcheck: `/api/v1/healthz`.
- `ingest` — seeds on start, warm-collects, then the scheduler loop. Healthcheck: `planetai-ingest healthz` (fails if no ingest run finished in the last 30 min).
- `web` — binds **`127.0.0.1:${WEB_PORT}`** only (never public). Healthcheck: `GET /`.
- `caddy` *(profile `caddy`)* — TLS termination + gzip/zstd, proxies to `web:3000`.

### Reverse proxy

Use `make prod-up-caddy` (config: `infra/Caddyfile`), or bring your own pointing at
`127.0.0.1:${WEB_PORT}`:

```
planetai9.com {
    reverse_proxy 127.0.0.1:3000
}
```

The API is **not** exposed publicly — the web container reaches it over the compose
network (`http://api:8000`). To expose the JSON API, add an `/api` route in the proxy
to the api container.

### Operations

```bash
# logs
docker compose -f infra/docker-compose.prod.yml logs -f api ingest

# force a collection pass
docker compose -f infra/docker-compose.prod.yml exec ingest planetai-ingest collect

# moderate marketplace submissions
docker compose -f infra/docker-compose.prod.yml exec api python -m planetai_api.moderate list
docker compose -f infra/docker-compose.prod.yml exec api python -m planetai_api.moderate approve <slug>

# db backup — automated daily; run one now:
make prod-backup
# backups live in the `pgbackups` volume; restore:
docker compose -f infra/docker-compose.prod.yml exec -T postgres \
  psql -U planetai planetai < <(gunzip -c /path/to/planetai-YYYYMMDD.sql.gz)
```

Upgrades: `git pull && docker compose -f infra/docker-compose.prod.yml up -d --build`.
Migrations run automatically as the `api` container starts.

---

## Option B — web on Vercel, backend on a container host

### Web (Vercel)

- Root directory: `apps/web`
- Framework preset: Next.js (build `next build`, output auto)
- Env vars:
  - `PLANETAI_API_URL` → the **public** URL of the API (e.g. `https://api.planetai9.com`)
  - `PLANETAI_SITE_URL` → `https://planetai9.com`
- `output: "standalone"` in `next.config.mjs` is harmless on Vercel; it's there for the Docker path.

### API + ingest + data (Fly.io / Railway / Render / a VM)

Run the same two images the compose file builds:

- **API**: `apps/api/Dockerfile`, context = repo root. Start command is baked in
  (`alembic upgrade head && uvicorn ...`). Needs:
  - `PLANETAI_ENV=production`
  - `PLANETAI_DATABASE_URL=postgresql+psycopg://…`
  - `PLANETAI_REDIS_URL=redis://…`
  - `PLANETAI_SITE_URL=https://planetai9.com`
  - `PLANETAI_CORS_ORIGINS=https://planetai9.com` (comma-separate for several)
  - `PLANETAI_DOCS_ENABLED=false`
  - `PORT` (platform-provided)
  - Health check: `GET /api/v1/healthz`
- **ingest**: `services/ingest/Dockerfile`, context = repo root. Long-lived worker
  (no port). Same DB/Redis env, plus optional `PLANETAI_YOUTUBE_API_KEY`. Run **one**
  replica — the scheduler is not built for concurrent instances.

Provision managed Postgres 16 and Redis. The first migration enables `pg_trgm`; the
DB user needs `CREATE EXTENSION` rights (managed Postgres usually allows this for
`pg_trgm`).

---

## Environment reference

| var | default | notes |
|---|---|---|
| `PLANETAI_ENV` | `dev` | `production` disables verbose errors, tightens defaults |
| `PLANETAI_DATABASE_URL` | local:5442 | `postgresql+psycopg://user:pass@host:5432/db` |
| `PLANETAI_REDIS_URL` | `redis://localhost:6379/0` | cache + rate-limit storage |
| `PLANETAI_SITE_URL` | `http://localhost:3010` | canonical links, sitemap, RSS |
| `PLANETAI_CORS_ORIGINS` | `http://localhost:3010` | comma-separated allowed origins |
| `PLANETAI_DOCS_ENABLED` | `true` | set `false` in prod to hide `/docs` |
| `PLANETAI_RATE_LIMIT_DEFAULT` | `120/minute` | per-IP, fixed window |
| `PLANETAI_RATE_LIMIT_SUBMIT` | `8/hour` | marketplace submissions |
| `PLANETAI_ADMIN_TOKEN` | — | `/yonetim` marketplace panel; unset ⇒ 404 |
| `PLANETAI_AUTHOR_KEYS` | — | `/yazar` studio: `slug:secret,slug2:secret2`; unset ⇒ 404 |
| `PLANETAI_MODERATOR_AUTHORS` | — | author slugs allowed to moderate marketplace |
| `PLANETAI_GOOGLE_TRANSLATE_API_KEY` | — | TR↔EN translation (ingest); unset ⇒ no-op. docs/07-translation.md |
| `PLANETAI_SENTRY_DSN` | — | error monitoring (api + ingest); unset ⇒ off |
| `PLANETAI_YOUTUBE_API_KEY` | — | optional; scraping works without it |
| `PLANETAI_API_URL` (web) | `http://localhost:8077` | where the web server fetches data |
| `PLANETAI_SITE_URL` (web) | `https://planetai9.com` | metadataBase, sitemap, robots |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` (web) | — | server / client error monitoring |
| `SITE_DOMAIN` (compose) | — | host only (no scheme); required for the `caddy` profile |
| `BACKUP_SCHEDULE` / `BACKUP_KEEP_*` | `@daily` / 7·4·6 | `backup` service cron + retention |
| `OFFSITE_S3_*` / `OFFSITE_CRON` | — | off-site backup target (S3/B2/R2/MinIO); needs `--profile offsite` |

---

## Pre-deploy checklist

- [ ] `make check` green (ruff · format · pytest · `alembic check` · web tsc · web build)
- [ ] `infra/.env.prod` filled, **not** committed — strong `POSTGRES_PASSWORD`, `ADMIN_TOKEN`, `AUTHOR_KEYS`
- [ ] `SITE_DOMAIN` set + DNS A/AAAA → the server (for `make prod-up-caddy`), or your own proxy → `127.0.0.1:${WEB_PORT}`
- [ ] TLS issued (Caddy does this automatically once DNS resolves)
- [ ] `alembic upgrade head` succeeded (check `api` logs); `/api/v1/healthz` → 200
- [ ] `docker compose … ps` shows `api`, `ingest`, `web` **healthy**
- [ ] a collection pass produced events; home page renders in TR and EN
- [ ] `robots.txt` and `sitemap.xml` resolve with the right host; `/yonetim` and `/yazar` login work
- [ ] `GOOGLE_TRANSLATE_API_KEY` set → one-time backfill: `docker compose … run --rm ingest planetai-ingest translate --limit 500`
- [ ] `SENTRY_DSN` set (recommended) — trigger a test error, confirm it lands
- [ ] first `make prod-backup` succeeds; `pgbackups` volume has a dump
