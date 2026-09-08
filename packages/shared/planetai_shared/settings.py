"""Environment-driven settings shared by the API and ingest services."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PLANETAI_", env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://planetai:planetai@localhost:5442/planetai"
    redis_url: str = "redis://localhost:6379/0"

    # ingest
    user_agent: str = "PlanetAIBot/0.1 (+https://planetai.example/bot)"
    http_timeout_sec: float = 20.0
    youtube_api_key: str | None = None
    youtube_channel_id: str | None = None
    max_article_age_days: int = 75
    max_items_per_fetch: int = 250
    dedup_lookback_hours: int = 72
    dedup_title_similarity: float = 0.82  # 0..1 rapidfuzz token_set_ratio / 100
    dedup_simhash_max_distance: int = 4

    # api
    cors_origins: list[str] = ["http://localhost:3000"]
    cache_ttl_home_sec: int = 60
    cache_ttl_list_sec: int = 90

    # feature flags
    ai_enrich_enabled: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
