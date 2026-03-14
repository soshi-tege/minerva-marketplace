from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from backend.services.auth_service import is_minerva_email, validate_password
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import db, User

auth_bp = Blueprint("auth", __name__)

CITIES = ["San Francisco", "Buenos Aires", "Hyderabad", "Taipei", "Seoul", "Tokyo", "Berlin"]

@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    city = (data.get("city") or "").strip()
    cohort = (data.get("cohort") or "").strip()

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use your @uni.minerva.edu email."), 400
    if not first_name:
        return jsonify(ok=False, error="First name is required."), 400
    if not last_name:
        return jsonify(ok=False, error="Last name is required."), 400
    if not city or city not in CITIES:
        return jsonify(ok=False, error="Please select a valid city."), 400
    if not cohort:
        return jsonify(ok=False, error="Cohort is required (e.g. M27)."), 400
    try:
        validate_password(password)
    except ValueError as e:
        return jsonify(ok=False, error=str(e)), 400

    if User.query.filter_by(email=email).first():
        return jsonify(ok=False, error="Email already registered. Please log in."), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
        first_name=first_name,
        last_name=last_name,
        city=city,
        cohort=cohort,
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(
        ok=True,
        token=create_access_token(identity=str(new_user.id)),
        user=new_user.to_dict(),
    )

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "")
    password = data.get("password", "")

    if not is_minerva_email(email):
        return jsonify(ok=False, error="Use your @uni.minerva.edu email."), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(ok=False, error="No account found for that email."), 404
    if not check_password_hash(user.password_hash, password):
        return jsonify(ok=False, error="Incorrect password."), 401

    return jsonify(
        ok=True,
        token=create_access_token(identity=str(user.id)),
        user=user.to_dict(),
    )
