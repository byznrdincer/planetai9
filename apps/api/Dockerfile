# PlanetAI9 API — build context is the repo root.
FROM ghcr.io/astral-sh/uv:0.9-python3.12-bookworm-slim AS build

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app

# dependency layer (cached unless a manifest changes)
COPY pyproject.toml uv.lock ./
COPY packages/shared/pyproject.toml packages/shared/
COPY apps/api/pyproject.toml apps/api/
COPY services/ingest/pyproject.toml services/ingest/
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-workspace --package planetai-api

# source
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY infra/migrations/ infra/migrations/
COPY alembic.ini ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --package planetai-api

FROM python:3.12-slim-bookworm AS runtime
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=build --chown=app:app /app /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER app
EXPOSE 8000

# run migrations then serve
CMD ["sh", "-c", "alembic upgrade head && uvicorn planetai_api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
