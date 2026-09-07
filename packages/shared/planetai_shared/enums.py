"""Shared enumerations for PlanetAI. Single source of truth for API + ingest + web."""

from __future__ import annotations

from enum import StrEnum


class Category(StrEnum):
    MODELS = "Models"
    COMPANIES = "Companies"
    RESEARCH = "Research"
    ROBOTICS = "Robotics"
    AGENTS = "Agents"
    AI_CODING = "AICoding"
    GENERATIVE_AI = "GenerativeAI"
    COMPUTER_VISION = "ComputerVision"
    VOICE_AI = "VoiceAI"
    HEALTHCARE_AI = "HealthcareAI"
    FINANCE_AI = "FinanceAI"
    OPEN_SOURCE = "OpenSource"
    AI_SAFETY = "AISafety"
    REGULATION = "Regulation"
    INFRASTRUCTURE = "Infrastructure"


class SourceKind(StrEnum):
    RSS = "rss"
    HTML_BLOG = "html_blog"
    ARXIV = "arxiv"
    YOUTUBE = "youtube"
    NEWS_API = "news_api"


class SourceType(StrEnum):
    PRIMARY = "primary"
    OFFICIAL_ANNOUNCEMENT = "official_announcement"
    MAJOR_NEWS = "major_news"
    RESEARCH_PAPER = "research_paper"
    COMMUNITY = "community"
    SOCIAL = "social"


PRIMARY_SOURCE_TYPES = frozenset({SourceType.PRIMARY, SourceType.OFFICIAL_ANNOUNCEMENT})


class EntityType(StrEnum):
    COMPANY = "company"
    MODEL = "model"
    PRODUCT = "product"
    TOOL = "tool"
    PERSON = "person"
    TECHNOLOGY = "technology"
    INSTITUTION = "institution"


class RelationType(StrEnum):
    DEVELOPS = "develops"
    OWNS = "owns"
    BASED_ON = "based_on"
    COMPETES_WITH = "competes_with"
    POWERS = "powers"
    WORKS_AT = "works_at"
    PUBLISHED_BY = "published_by"
    SUCCESSOR_OF = "successor_of"
    INTEGRATES = "integrates"


class Impact(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TrendWindow(StrEnum):
    H24 = "24h"
    D7 = "7d"


def importance_band(score: float) -> Impact:
    """Map a 0..10 importance score to an impact band."""
    if score >= 9:
        return Impact.CRITICAL
    if score >= 7:
        return Impact.HIGH
    if score >= 4:
        return Impact.MEDIUM
    return Impact.LOW
