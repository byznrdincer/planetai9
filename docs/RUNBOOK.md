# Runbook — local development

## Prerequisites
- `uv` (Python), Node 20+, Docker

## 1. Infrastructure
```bash
docker compose -f infra/docker-compose.yml up -d      # postgres:5442, redis:6379
```

## 2. Backend (Python workspace)
```bash
uv sync --all-packages
cp .env.example .env                                   # edit if needed
uv run alembic upgrade head                            # create schema
uv run planetai-ingest seed                            # load sources/entities/topics
uv run planetai-ingest collect                         # one full collection pass
uv run planetai-ingest trends                          # trend snapshots + top signals
```

Run the API:
```bash
uv run uvicorn planetai_api.main:app --port 8077 --reload
# docs at http://localhost:8077/docs
```

Run the scheduler (long-lived; does seed + warm collect on start):
```bash
uv run planetai-ingest scheduler
```

## 3. Frontend
```bash
cd apps/web
npm install
cp .env.example .env.local                             # PLANETAI_API_URL=http://localhost:8077
npm run dev                                            # http://localhost:3000
```

## YouTube videos
Set in `.env`:
```
PLANETAI_YOUTUBE_API_KEY=...
PLANETAI_YOUTUBE_CHANNEL_ID=UC...
```
then `uv run planetai-ingest collect --kinds youtube`.

## CLI reference
| command | purpose |
|---|---|
| `planetai-ingest seed` | upsert seed YAML into DB (idempotent) |
| `planetai-ingest collect [--kinds rss,arxiv,youtube]` | one collection pass |
| `planetai-ingest trends` | recompute trend snapshots + refresh top signals |
| `planetai-ingest scheduler` | APScheduler loop (10m news / 60m arxiv+yt / 30m trends) |

## Ports
| service | port | note |
|---|---|---|
| postgres | 5442 | 5432/5433 avoided — local Postgres already runs there |
| redis | 6379 | |
| api | 8077 | |
| web | 3000 | use another port if taken |
