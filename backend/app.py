from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity
from backend.models import db, Item
from backend.routes.auth import auth_bp
from backend.routes.messages import messages_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "dev-secret-change-in-production"
db.init_app(app)
JWTManager(app)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(messages_bp)

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
    if city:
        query = query.filter_by(city=city)
    if listing_type:
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
    data = request.get_json()
    item = Item(
        seller_id=seller_id,
        title=data.get("title"),
        category=data.get("category"),
        price=data.get("price_cents", 0),
        currency="USD",
        condition=data.get("condition", "Good"),
        location=data.get("location"),
        description=data.get("description"),
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

    data = request.get_json()
    item.title = data.get("title", item.title)
    item.category = data.get("category", item.category)
    item.price = data.get("price_cents", item.price)
    item.condition = data.get("condition", item.condition)
    item.location = data.get("location", item.location)
    item.description = data.get("description", item.description)
    item.status = data.get("status", item.status)
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

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(port=5001, debug=True)
