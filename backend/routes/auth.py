from flask import Blueprint, jsonify, request
from backend.services.auth_service import is_minerva_email, validate_password, issue_fake_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use @minerva.edu or @edu.minerva.edu"), 400

    try:
        validate_password(password)
    except ValueError as e:
        return jsonify(ok=False, error=str(e)), 400

    return jsonify(ok=True, email=email.strip().lower(), token=issue_fake_token())

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use @minerva.edu or @edu.minerva.edu"), 400

    try:
        validate_password(password)
    except ValueError as e:
        return jsonify(ok=False, error=str(e)), 400

    return jsonify(ok=True, email=email.strip().lower(), token=issue_fake_token())

