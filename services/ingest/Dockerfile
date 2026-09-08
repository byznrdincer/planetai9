# PlanetAI9 ingest worker — build context is the repo root.
FROM ghcr.io/astral-sh/uv:0.9-python3.12-bookworm-slim AS build

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY packages/shared/pyproject.toml packages/shared/
COPY apps/api/pyproject.toml apps/api/
COPY services/ingest/pyproject.toml services/ingest/
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-workspace --package planetai-ingest

COPY packages/shared/ packages/shared/
COPY services/ingest/ services/ingest/
COPY infra/ infra/
COPY alembic.ini ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --package planetai-ingest

FROM python:3.12-slim-bookworm AS runtime
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=build --chown=app:app /app /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1 PLANETAI_SEED_DIR=/app/infra/seed
USER app

# long-lived scheduler (seed + warm collect on start, then the loop)
CMD ["planetai-ingest", "scheduler"]
