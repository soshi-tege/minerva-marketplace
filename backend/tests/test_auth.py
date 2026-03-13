from backend import app as app_module
from ..app import app
app = app_module.app

def test_health_ok():
    client = app.test_client()
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"

def test_signup_accepts_minerva_email():
    client = app.test_client()
    resp = client.post(
        "/api/auth/signup",
        json={"email": "test@minerva.edu", "password": "123456"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert data["email"] == "test@minerva.edu"
    assert "token" in data

def test_signup_rejects_non_minerva_email():
    client = app.test_client()
    resp = client.post(
        "/api/auth/signup",
        json={"email": "test@gmail.com", "password": "123456"},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["ok"] is False
    assert "error" in data

def test_login_accepts_edu_minerva_email():
    client = app.test_client()
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@edu.minerva.edu", "password": "123456"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert data["email"] == "test@edu.minerva.edu"
    assert "token" in data

