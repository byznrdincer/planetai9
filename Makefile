.PHONY: help install lint fmt test check api ingest scheduler web migrate seed collect trends up down prod-up prod-up-caddy prod-up-full prod-down prod-backup

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## sync python workspace + web deps
	uv sync --all-packages --dev
	cd apps/web && npm ci

lint: ## ruff check
	uv run ruff check .

fmt: ## ruff format
	uv run ruff format .

test: ## pytest
	uv run pytest -q

check: ## lint + format check + tests + web typecheck/build
	uv run ruff check .
	uv run ruff format --check .
	uv run pytest -q
	cd apps/web && npx tsc --noEmit && NEXT_TELEMETRY_DISABLED=1 npx next build

up: ## start local postgres + redis
	docker compose -f infra/docker-compose.yml up -d

down: ## stop local infra
	docker compose -f infra/docker-compose.yml down

migrate: ## alembic upgrade head
	uv run alembic upgrade head

seed: ## load seed YAML
	uv run planetai-ingest seed

collect: ## one collection pass
	uv run planetai-ingest collect

trends: ## recompute trend snapshots
	uv run planetai-ingest trends

api: ## run API (reload)
	uv run uvicorn planetai_api.main:app --port 8077 --reload

scheduler: ## run the ingest scheduler loop
	uv run planetai-ingest scheduler

web: ## run the web dev server
	cd apps/web && npm run dev

prod-up: ## build + start the self-host production stack (bring your own TLS proxy)
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build

prod-up-caddy: ## prod stack + bundled Caddy TLS proxy (needs SITE_DOMAIN)
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod --profile caddy up -d --build

prod-up-full: ## prod stack + Caddy TLS + off-site S3 backups
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod --profile caddy --profile offsite up -d --build

prod-down: ## stop the production stack
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod --profile caddy --profile offsite down

prod-backup: ## run an on-demand database backup now
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod exec backup /backup.sh
