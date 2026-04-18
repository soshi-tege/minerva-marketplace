import pytest
from backend.app import create_app
from backend.models import db as _db


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return _db


def signup(client, email="test@uni.minerva.edu", password="securepass123",
           first_name="Test", last_name="User", city="San Francisco", cohort="M28"):
    return client.post("/api/auth/signup", json={
        "email": email, "password": password,
        "first_name": first_name, "last_name": last_name,
        "city": city, "cohort": cohort,
    })


def get_token(client, email="test@uni.minerva.edu", **kwargs):
    resp = signup(client, email=email, **kwargs)
    return resp.get_json()["token"]


def create_item(client, token, title="Test Item", category="Electronics",
                price_cents=5000, condition="Good", location="San Francisco",
                description="A test item", listing_type="offering"):
    resp = client.post("/api/items", json={
        "title": title, "category": category, "price_cents": price_cents,
        "condition": condition, "location": location, "description": description,
        "listing_type": listing_type,
    }, headers={"Authorization": f"Bearer {token}"})
    return resp.get_json()
