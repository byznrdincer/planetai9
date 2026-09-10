from planetai_ingest.pipeline import classify
from planetai_ingest.pipeline.entities import EntityHit, EntityIndex, choose_primary
from planetai_ingest.pipeline.score import Factors
from planetai_shared.enums import Impact, importance_band


def test_importance_band_thresholds():
    assert importance_band(9.5) == Impact.CRITICAL
    assert importance_band(7.2) == Impact.HIGH
    assert importance_band(5.0) == Impact.MEDIUM
    assert importance_band(2.0) == Impact.LOW


def test_factors_total_is_bounded():
    f = Factors(
        source_reliability=1,
        independent_sources=1,
        entity_impact=1,
        novelty=1,
        market_impact=1,
        velocity=1,
    )
    assert 0 <= f.total() <= 10
    assert Factors().total() == 0.0


def test_classify_category_rules():
    hits = [EntityHit("x", "model", "GPT", 1.0, True)]
    cat = classify.classify_category(
        title="OpenAI launches GPT-6, a new frontier model",
        summary="benchmark results improve",
        source_kind="rss",
        source_slug="openai-news",
        hits=hits,
    )
    assert cat == "Models"

    robo = classify.classify_category(
        title="Figure unveils a new humanoid robot for warehouses",
        summary="the robot can walk and manipulate objects",
        source_kind="rss",
        source_slug="the-robot-report",
        hits=[],
    )
    assert robo == "Robotics"

    arxiv = classify.classify_category(
        title="A study of attention",
        summary="",
        source_kind="arxiv",
        source_slug="arxiv-cs-ai",
        hits=[],
    )
    assert arxiv == "Research"


def test_entity_index_matches_aliases_and_boundaries():
    idx = EntityIndex(
        [
            ("1", "company", "Anthropic", [], 1.0),
            ("2", "model", "Claude", ["Claude Opus", "Claude Sonnet"], 1.0),
            ("3", "company", "OpenAI", ["Open AI"], 1.0),
        ]
    )
    hits = idx.match("Anthropic ships Claude Opus 5", "OpenAI responds")
    names = {h.name for h in hits}
    assert names == {"Anthropic", "Claude", "OpenAI"}
    assert {h.name for h in hits if h.in_title} == {"Anthropic", "Claude"}

    primary = choose_primary(hits)
    assert primary.name == "Claude"  # model beats company, and it's in the title

    # word-boundary: "openair" must not match "OpenAI"
    assert idx.match("the openair festival", "") == []
