def test_healthz(client):
    r = client.get("/api/v1/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_home_shape(client):
    r = client.get("/api/v1/home")
    assert r.status_code == 200
    body = r.json()
    for key in (
        "top_signals",
        "latest_news",
        "popular",
        "trending",
        "videos",
        "timeline",
        "columns",
        "sections",
    ):
        assert key in body


def test_events_filters(client):
    assert client.get("/api/v1/events?limit=5").status_code == 200
    assert client.get("/api/v1/events?bucket=AI&limit=5").status_code == 200
    assert client.get("/api/v1/events?region=TR&limit=5").status_code == 200
    assert client.get("/api/v1/events?entity=does-not-exist").status_code == 404


def test_categories_and_sources(client):
    cats = client.get("/api/v1/categories").json()
    assert any(c["category"] == "Models" for c in cats)
    assert client.get("/api/v1/sources").status_code == 200


def test_search_requires_two_chars(client):
    assert client.get("/api/v1/search?q=a").status_code == 422
    assert client.get("/api/v1/search?q=ai").status_code == 200


def test_marketplace_submission_lands_pending(client):
    payload = {
        "name": "PyTest Sample App",
        "category": "tool",
        "tagline": "an app submitted from the test suite for validation",
        "url": "https://example.com/pytest-app",
        "author_name": "Test Suite",
    }
    r = client.post("/api/v1/marketplace", json=payload)
    assert r.status_code == 201
    assert r.json()["status"] == "pending"
    # it must NOT appear in the public (approved) listing
    listed = client.get("/api/v1/marketplace").json()
    assert all(a["name"] != "PyTest Sample App" for a in listed)


def test_marketplace_rejects_bad_category(client):
    r = client.post(
        "/api/v1/marketplace",
        json={
            "name": "Bad",
            "category": "nope",
            "tagline": "x" * 12,
            "url": "https://example.com",
            "author_name": "t",
        },
    )
    assert r.status_code == 422
