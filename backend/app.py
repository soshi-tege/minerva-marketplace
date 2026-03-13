from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.models import db, Item
from backend.routes.auth import auth_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)  # allow all origins (dev only)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/items")
def get_items():
    city = request.args.get("city")
    listing_type = request.args.get("listing_type")

    query = Item.query

    if city:
        query = query.filter_by(city=city)

    if listing_type:
        query = query.filter_by(listing_type=listing_type)

    items = query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])


app.register_blueprint(auth_bp, url_prefix="/api/auth")

with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(port=5001, debug=True)


