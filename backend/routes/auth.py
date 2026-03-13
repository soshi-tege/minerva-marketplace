from flask import Blueprint, jsonify, request
from backend.services.auth_service import is_minerva_email, validate_password, issue_fake_token
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use @minerva.edu or @edu.minerva.edu"), 400
    
    if not first_name:
        return jsonify(ok=False, error="First name is required."), 400

    if not last_name:
        return jsonify(ok=False, error="Last name is required."), 400
    
    try:
        validate_password(password)
    except ValueError as e:
        return jsonify(ok=False, error=str(e)), 400
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify(ok=False, error="Email already registered. Please log in."), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        first_name=first_name,
        last_name=last_name,
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(
        ok=True,
        email=new_user.email,
        first_name=new_user.first_name,
        token=issue_fake_token(),
    )

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use @minerva.edu or @edu.minerva.edu"), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(ok=False, error="No account found for that email."), 404

    if not check_password_hash(user.password_hash, password):
        return jsonify(ok=False, error="Incorrect password."), 401
    
    return jsonify(
        ok=True,
        email=user.email,
        first_name=user.first_name,
        token=issue_fake_token(),
    )

