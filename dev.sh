#!/usr/bin/env bash
# PlanetAI9 — local ortamı ayağa kaldır.
# Kullanım:  ./dev.sh            (her şeyi başlat)
#            ./dev.sh stop       (durdur)
set -euo pipefail
cd "$(dirname "$0")"

API_PORT=8077
WEB_PORT=3010   # 3000 LLM Radar'da kullanılıyor

if [ "${1:-}" = "stop" ]; then
  pkill -f "uvicorn planetai_api" 2>/dev/null || true
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "next start -p $WEB_PORT" 2>/dev/null || true
  docker compose -f infra/docker-compose.yml stop
  echo "durduruldu."
  exit 0
fi

echo "▶ postgres + redis"
docker compose -f infra/docker-compose.yml up -d

echo "▶ db migrate + seed"
uv run alembic upgrade head
uv run planetai-ingest seed

echo "▶ API  → http://localhost:$API_PORT"
pkill -f "uvicorn planetai_api" 2>/dev/null || true
(uv run uvicorn planetai_api.main:app --port "$API_PORT" --reload >/tmp/planetai-api.log 2>&1 &)

echo "▶ WEB  → http://localhost:$WEB_PORT"
pkill -f "next-server" 2>/dev/null || true
( cd apps/web && npm run dev -- -p "$WEB_PORT" >/tmp/planetai-web.log 2>&1 & )

sleep 4
echo
echo "  ✅  Site:  http://localhost:$WEB_PORT"
echo "      API:   http://localhost:$API_PORT/docs"
echo
echo "  İlk kez veya güncel haber için:  uv run planetai-ingest collect && uv run planetai-ingest trends"
