import base64
import os
import re
import uuid
from typing import Optional

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity
from sqlalchemy import inspect, text
from werkzeug.utils import secure_filename

from backend.models import db, Item
from backend.routes.auth import auth_bp
from backend.routes.messages import messages_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_IMAGE_EXTENSIONS = frozenset({"png", "jpg", "jpeg", "gif", "webp"})

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "dev-secret-change-in-production"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB uploads

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

db.init_app(app)
JWTManager(app)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(messages_bp)


def _allowed_image(filename):
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_IMAGE_EXTENSIONS


def _save_image_bytes(raw: bytes, ext: str) -> Optional[str]:
    ext = (ext or "png").lower()
    if ext == "jpeg":
        ext = "jpg"
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return None
    name = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], name)
    with open(path, "wb") as f:
        f.write(raw)
    return f"/uploads/{name}"


def _save_upload_file(file_storage) -> Optional[str]:
    if not file_storage or not file_storage.filename:
        return None
    if not _allowed_image(file_storage.filename):
        return None
    safe = secure_filename(file_storage.filename)
    if "." not in safe:
        return None
    ext = safe.rsplit(".", 1)[1].lower()
    name = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], name)
    file_storage.save(path)
    return f"/uploads/{name}"


def _save_base64_image(data: str) -> Optional[str]:
    if not data or not isinstance(data, str):
        return None
    payload = data.strip()
    ext = "png"
    if payload.startswith("data:"):
        m = re.match(r"data:image/(\w+);base64,(.+)", payload, re.DOTALL)
        if not m:
            return None
        mime_ext, b64 = m.group(1).lower(), m.group(2)
        ext = "jpg" if mime_ext in ("jpeg", "jpg") else mime_ext
    else:
        b64 = payload
    try:
        raw = base64.b64decode(b64)
    except Exception:
        return None
    return _save_image_bytes(raw, ext)


def ensure_items_image_url_column():
    with app.app_context():
        db.create_all()
        insp = inspect(db.engine)
        if "items" not in insp.get_table_names():
            return
        cols = {c["name"] for c in insp.get_columns("items")}
        if "image_url" in cols:
            return
        with db.engine.begin() as conn:
            conn.execute(text("ALTER TABLE items ADD COLUMN image_url VARCHAR(512)"))


@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    safe = secure_filename(os.path.basename(filename))
    if not safe or safe != os.path.basename(filename):
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(app.config["UPLOAD_FOLDER"], safe)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/items/<int:item_id>")
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict())


@app.route("/api/items", methods=["GET"])
def get_items():
    city = request.args.get("city")
    listing_type = request.args.get("listing_type")
    q = request.args.get("q", "").strip()
    query = Item.query
    if city and hasattr(Item, "city"):
        query = query.filter_by(city=city)
    if listing_type and hasattr(Item, "listing_type"):
        query = query.filter_by(listing_type=listing_type)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            Item.title.ilike(pattern) | Item.description.ilike(pattern)
        )
    items = query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])


@app.route("/api/items", methods=["POST"])
def create_item():
    try:
        verify_jwt_in_request()
        seller_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    image_url = None

    if request.content_type and "multipart/form-data" in request.content_type:
        title = request.form.get("title")
        category = request.form.get("category")
        location = request.form.get("location")
        description = request.form.get("description")
        condition = request.form.get("condition") or "Good"
        try:
            price_cents = int(request.form.get("price_cents", 0))
        except (TypeError, ValueError):
            price_cents = 0
        file = request.files.get("image")
        image_url = _save_upload_file(file)
        item = Item(
            seller_id=seller_id,
            title=title,
            category=category,
            price=price_cents,
            currency="USD",
            condition=condition,
            location=location,
            description=description,
            image_url=image_url,
        )
    else:
        data = request.get_json(silent=True) or {}
        image_url = None
        if data.get("image_base64"):
            image_url = _save_base64_image(data["image_base64"])
        item = Item(
            seller_id=seller_id,
            title=data.get("title"),
            category=data.get("category"),
            price=data.get("price_cents", 0),
            currency="USD",
            condition=data.get("condition", "Good"),
            location=data.get("location"),
            description=data.get("description"),
            image_url=image_url or data.get("image_url"),
        )

    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    item = Item.query.get_or_404(item_id)
    if item.seller_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    if request.content_type and "multipart/form-data" in request.content_type:
        if request.files.get("image"):
            saved = _save_upload_file(request.files.get("image"))
            if saved:
                item.image_url = saved
        item.title = request.form.get("title", item.title)
        item.category = request.form.get("category", item.category)
        try:
            if request.form.get("price_cents") is not None:
                item.price = int(request.form.get("price_cents"))
        except (TypeError, ValueError):
            pass
        item.condition = request.form.get("condition", item.condition)
        item.location = request.form.get("location", item.location)
        item.description = request.form.get("description", item.description)
        item.status = request.form.get("status", item.status)
    else:
        data = request.get_json(silent=True) or {}
        item.title = data.get("title", item.title)
        item.category = data.get("category", item.category)
        item.price = data.get("price_cents", item.price)
        item.condition = data.get("condition", item.condition)
        item.location = data.get("location", item.location)
        item.description = data.get("description", item.description)
        item.status = data.get("status", item.status)
        if data.get("image_base64"):
            saved = _save_base64_image(data["image_base64"])
            if saved:
                item.image_url = saved
        elif "image_url" in data:
            item.image_url = data.get("image_url")

    db.session.commit()
    return jsonify(item.to_dict())


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    item = Item.query.get_or_404(item_id)
    if item.seller_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


ensure_items_image_url_column()

if __name__ == "__main__":
    app.run(port=5001, debug=True)
