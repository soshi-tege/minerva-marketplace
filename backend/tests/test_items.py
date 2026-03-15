import pytest
from backend.app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        from backend.models import db
        db.create_all()
        yield app.test_client()
        db.drop_all()


def _register_and_get_token(client):
    """Helper: register a user and return the JWT token."""
    resp = client.post(
        "/api/auth/signup",
        json={
            "email": "seller@uni.minerva.edu",
            "password": "securepass123",
            "first_name": "Seller",
            "last_name": "One",
            "city": "Tokyo",
            "cohort": "M28",
        },
    )
    return resp.get_json()["token"]


def _create_item(client, token, title="Rice Cooker", description="Barely used"):
    """Helper: create an item and return the item dict."""
    resp = client.post(
        "/api/items",
        json={
            "title": title,
            "category": "Appliances",
            "price_cents": 2500,
            "condition": "Good",
            "location": "Tokyo",
            "description": description,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.get_json()


# ── DELETE tests ──────────────────────────────────────────────

def test_delete_own_item(client):
    token = _register_and_get_token(client)
    item = _create_item(client, token)

    resp = client.delete(
        f"/api/items/{item['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Item deleted"

    # Confirm it's gone
    resp = client.get(f"/api/items/{item['id']}")
    assert resp.status_code == 404


def test_delete_without_auth(client):
    token = _register_and_get_token(client)
    item = _create_item(client, token)

    resp = client.delete(f"/api/items/{item['id']}")
    assert resp.status_code == 401


def test_delete_other_users_item(client):
    token1 = _register_and_get_token(client)
    item = _create_item(client, token1)

    # Register a second user
    resp = client.post(
        "/api/auth/signup",
        json={
            "email": "other@uni.minerva.edu",
            "password": "securepass123",
            "first_name": "Other",
            "last_name": "User",
            "city": "Seoul",
            "cohort": "M27",
        },
    )
    token2 = resp.get_json()["token"]

    resp = client.delete(
        f"/api/items/{item['id']}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403


# ── Search tests ──────────────────────────────────────────────

def test_search_items_by_title(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Rice Cooker", description="Works great")
    _create_item(client, token, title="Desk Lamp", description="LED lamp")

    resp = client.get("/api/items?q=rice")
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Rice Cooker"


def test_search_items_by_description(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Lamp", description="Bright LED light")
    _create_item(client, token, title="Pot", description="Cast iron pot")

    resp = client.get("/api/items?q=LED")
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Lamp"


def test_search_no_match(client):
    token = _register_and_get_token(client)
    _create_item(client, token)

    resp = client.get("/api/items?q=nonexistent")
    data = resp.get_json()
    assert len(data) == 0


def test_search_empty_query_returns_all(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Item A")
    _create_item(client, token, title="Item B")

    resp = client.get("/api/items?q=")
    data = resp.get_json()
    assert len(data) == 2
