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


def test_health_ok(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_signup_accepts_minerva_email(client):
    resp = client.post(
        "/api/auth/signup",
        json={
            "email": "test@uni.minerva.edu",
            "password": "securepass123",
            "first_name": "Test",
            "last_name": "User",
            "city": "Seoul",
            "cohort": "M27",
        },
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert "token" in data


def test_signup_rejects_non_minerva_email(client):
    resp = client.post(
        "/api/auth/signup",
        json={
            "email": "test@gmail.com",
            "password": "securepass123",
            "first_name": "Test",
            "last_name": "User",
            "city": "Seoul",
            "cohort": "M27",
        },
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["ok"] is False


def test_login_known_user(client):
    # First register
    client.post(
        "/api/auth/signup",
        json={
            "email": "login@uni.minerva.edu",
            "password": "securepass123",
            "first_name": "Login",
            "last_name": "User",
            "city": "Tokyo",
            "cohort": "M28",
        },
    )
    # Then login
    resp = client.post(
        "/api/auth/login",
        json={"email": "login@uni.minerva.edu", "password": "securepass123"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert "token" in data


def test_login_wrong_password(client):
    # Register first
    client.post(
        "/api/auth/signup",
        json={
            "email": "wrong@uni.minerva.edu",
            "password": "securepass123",
            "first_name": "Wrong",
            "last_name": "Pass",
            "city": "Berlin",
            "cohort": "M27",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "wrong@uni.minerva.edu", "password": "badpassword"},
    )
    assert resp.status_code == 401
