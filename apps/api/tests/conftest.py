import pytest
from fastapi.testclient import TestClient
from planetai_shared.db.base import engine
from sqlalchemy import text


def _db_ready() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("select 1 from events limit 1"))
        return True
    except Exception:
        return False


DB_READY = _db_ready()


def pytest_collection_modifyitems(config, items):
    if DB_READY:
        return
    skip = pytest.mark.skip(reason="database not migrated/reachable")
    for item in items:
        if "test_api" in item.nodeid:
            item.add_marker(skip)


@pytest.fixture(scope="session")
def client() -> TestClient:
    from planetai_api.main import app

    return TestClient(app)
