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


def _create_item(client, token, title="Rice Cooker", description="Barely used", listing_type="offering", location="Tokyo"):
    """Helper: create an item and return the item dict."""
    resp = client.post(
        "/api/items",
        json={
            "title": title,
            "category": "Appliance",
            "price_cents": 2500,
            "condition": "Good",
            "location": location,
            "description": description,
            "listing_type": listing_type,
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

    # confirm it's gone
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
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Rice Cooker"


def test_search_items_by_description(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Lamp", description="Bright LED light")
    _create_item(client, token, title="Pot", description="Cast iron pot")

    resp = client.get("/api/items?q=LED")
    data = resp.get_json()
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Lamp"


def test_search_no_match(client):
    token = _register_and_get_token(client)
    _create_item(client, token)

    resp = client.get("/api/items?q=nonexistent")
    data = resp.get_json()
    assert len(data["items"]) == 0


def test_search_empty_query_returns_all(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Item A")
    _create_item(client, token, title="Item B")

    resp = client.get("/api/items?q=")
    data = resp.get_json()
    assert len(data["items"]) == 2


# ── listing_type filter tests ─────────────────────────────────

def test_filter_by_listing_type_offering(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Sofa", listing_type="offering")
    _create_item(client, token, title="Need a Lamp", listing_type="request")

    resp = client.get("/api/items?listing_type=offering")
    data = resp.get_json()
    assert all(i["listing_type"] == "offering" for i in data["items"])
    assert any(i["title"] == "Sofa" for i in data["items"])


def test_filter_by_listing_type_request(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Sofa", listing_type="offering")
    _create_item(client, token, title="Need a Lamp", listing_type="request")

    resp = client.get("/api/items?listing_type=request")
    data = resp.get_json()
    assert all(i["listing_type"] == "request" for i in data["items"])
    assert any(i["title"] == "Need a Lamp" for i in data["items"])


# ── city filter tests ─────────────────────────────────────────

def test_filter_by_city(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Tokyo Item", location="Tokyo")
    _create_item(client, token, title="Seoul Item", location="Seoul")

    resp = client.get("/api/items?city=Tokyo")
    data = resp.get_json()
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Tokyo Item"


def test_filter_by_city_no_match(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Tokyo Item", location="Tokyo")

    resp = client.get("/api/items?city=Berlin")
    data = resp.get_json()
    assert len(data["items"]) == 0


# ── pagination tests ──────────────────────────────────────────

def test_pagination_has_more(client):
    token = _register_and_get_token(client)
    for i in range(3):
        _create_item(client, token, title=f"Item {i}")

    resp = client.get("/api/items?page=1&per_page=2")
    data = resp.get_json()
    assert len(data["items"]) == 2
    assert data["has_more"] is True
    assert data["total"] == 3


def test_pagination_second_page(client):
    token = _register_and_get_token(client)
    for i in range(3):
        _create_item(client, token, title=f"Item {i}")

    resp = client.get("/api/items?page=2&per_page=2")
    data = resp.get_json()
    assert len(data["items"]) == 1
    assert data["has_more"] is False


# ── cities endpoint tests ─────────────────────────────────────

def test_get_cities(client):
    token = _register_and_get_token(client)
    _create_item(client, token, title="Tokyo Item", location="Tokyo")
    _create_item(client, token, title="Seoul Item", location="Seoul")
    _create_item(client, token, title="Another Tokyo", location="Tokyo")

    resp = client.get("/api/cities")
    data = resp.get_json()
    assert "Tokyo" in data
    assert "Seoul" in data
    assert data == sorted(data)       # sorted alphabetically
    assert data.count("Tokyo") == 1   # distinct, no duplicates


def test_get_cities_empty(client):
    resp = client.get("/api/cities")
    data = resp.get_json()
    assert data == []
