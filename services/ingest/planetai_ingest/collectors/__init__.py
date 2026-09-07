from planetai_ingest.collectors.base import BaseCollector, FetchResult, RawItem
from planetai_ingest.collectors.rss import ArxivCollector, RssCollector
from planetai_ingest.collectors.youtube import YouTubeCollector

_REGISTRY = {
    "rss": RssCollector,
    "html_blog": RssCollector,  # MVP: treat as rss; dedicated scraper later
    "arxiv": ArxivCollector,
    "youtube": YouTubeCollector,
}


def collector_for(source) -> BaseCollector:
    cls = _REGISTRY.get(source.kind)
    if cls is None:
        raise ValueError(f"no collector for source kind {source.kind!r}")
    return cls(source)


__all__ = ["BaseCollector", "FetchResult", "RawItem", "collector_for"]
