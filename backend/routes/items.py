from flask import Blueprint, jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..services import item_service

items_bp = Blueprint("items", __name__, url_prefix="/api")


@items_bp.get("/items")
def get_items():
    items_data = item_service.list_items(
        city=request.args.get("city"),
        listing_type=request.args.get("listing_type"),
        category=request.args.get("category"),
        q=request.args.get("q", "").strip() or None,
        sort=request.args.get("sort", "newest"),
        page=int(request.args.get("page", 1)),
        per_page=int(request.args.get("per_page", 20)),
    )
    return jsonify(items_data)


@items_bp.get("/items/<int:item_id>")
def get_item(item_id):
    item = item_service.get_item(item_id)
    return jsonify(item.to_dict())


@items_bp.post("/items")
def create_item():
    try:
        verify_jwt_in_request()
        seller_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    errors = item_service.validate_item_data(data, require_all=True)
    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 400

    item = item_service.create_item(seller_id, data)
    return jsonify(item.to_dict()), 201


@items_bp.put("/items/<int:item_id>")
def update_item(item_id):
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    item = item_service.get_item(item_id)
    if item.seller_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    errors = item_service.validate_item_data(data, require_all=False)
    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 400

    item = item_service.update_item(item, data)
    return jsonify(item.to_dict())


@items_bp.delete("/items/<int:item_id>")
def delete_item(item_id):
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    item = item_service.get_item(item_id)
    if item.seller_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    item_service.delete_item(item)
    return jsonify({"message": "Item deleted"}), 200


@items_bp.get("/categories")
def get_categories():
    return jsonify(item_service.get_categories())
