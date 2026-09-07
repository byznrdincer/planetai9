from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from planetai_api.routers import (
    authors,
    entities,
    events,
    home,
    marketplace,
    meta,
    search,
    trends,
    videos,
)
from planetai_shared.settings import get_settings

_settings = get_settings()

app = FastAPI(
    title="PlanetAI API",
    version="0.1.0",
    description="Read API for the PlanetAI intelligence platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

API_V1 = "/api/v1"
app.include_router(home.router, prefix=API_V1, tags=["home"])
app.include_router(events.router, prefix=API_V1, tags=["events"])
app.include_router(trends.router, prefix=API_V1, tags=["trends"])
app.include_router(videos.router, prefix=API_V1, tags=["videos"])
app.include_router(search.router, prefix=API_V1, tags=["search"])
app.include_router(entities.router, prefix=API_V1, tags=["entities"])
app.include_router(marketplace.router, prefix=API_V1, tags=["marketplace"])
app.include_router(authors.router, prefix=API_V1, tags=["authors"])
app.include_router(meta.router, prefix=API_V1, tags=["meta"])


@app.get("/")
def root() -> dict:
    return {"name": "PlanetAI API", "docs": "/docs", "base": API_V1}
