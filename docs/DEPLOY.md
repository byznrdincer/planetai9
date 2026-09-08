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
# edit infra/.env.prod:
#   SITE_URL=https://planetai9.com
#   POSTGRES_PASSWORD=<long random>
#   YOUTUBE_API_KEY=<optional>
#   WEB_PORT=3000

docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build
```

What comes up:

- `postgres` / `redis` — named volumes `pgdata`, `redisdata`
- `api` — runs `alembic upgrade head` on start, then uvicorn on `:8000` (internal only). Docs disabled (`PLANETAI_DOCS_ENABLED=false`), CORS locked to `SITE_URL`.
- `ingest` — seeds on start, warm-collects, then the scheduler loop
- `web` — binds `${WEB_PORT}:3000` on the host

### Reverse proxy (example: Caddy)

```
planetai9.com {
    reverse_proxy localhost:3000
}
```

The API is **not** exposed publicly — the web container talks to it over the compose
network (`http://api:8000`). If you need the public JSON API, add a `/api` route in the
proxy pointing at the api container and re-enable rate limits accordingly.

### Operations

```bash
# logs
docker compose -f infra/docker-compose.prod.yml logs -f api ingest

# force a collection pass
docker compose -f infra/docker-compose.prod.yml exec ingest planetai-ingest collect

# moderate marketplace submissions
docker compose -f infra/docker-compose.prod.yml exec api python -m planetai_api.moderate list
docker compose -f infra/docker-compose.prod.yml exec api python -m planetai_api.moderate approve <slug>

# db backup
docker compose -f infra/docker-compose.prod.yml exec postgres \
  pg_dump -U planetai planetai | gzip > backup-$(date +%F).sql.gz
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
| `PLANETAI_YOUTUBE_API_KEY` | — | optional; scraping works without it |
| `PLANETAI_API_URL` (web) | `http://localhost:8077` | where the web server fetches data |
| `PLANETAI_SITE_URL` (web) | `https://planetai9.com` | metadataBase, sitemap, robots |

---

## Pre-deploy checklist

- [ ] `uv run ruff check . && uv run ruff format --check .`
- [ ] `uv run pytest -q`
- [ ] `cd apps/web && npx tsc --noEmit && npx next build`
- [ ] `infra/.env.prod` filled, **not** committed
- [ ] DNS → reverse proxy / Vercel, TLS issued
- [ ] first `alembic upgrade head` succeeded (check `api` logs)
- [ ] `/api/v1/healthz` returns 200
- [ ] `planetai-ingest seed` ran (sources/entities/topics present)
- [ ] a collection pass produced events; home page renders
- [ ] `robots.txt` and `sitemap.xml` resolve with the right host
