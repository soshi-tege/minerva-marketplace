from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Item
from ..services import message_service

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/me")


@dashboard_bp.get("/dashboard")
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())

    all_items = Item.query.filter_by(seller_id=user_id).order_by(Item.created_at.desc()).all()
    active = [i.to_dict() for i in all_items if i.status == "active"]
    sold = [i.to_dict() for i in all_items if i.status == "sold"]

    conversations = message_service.get_conversations(user_id)
    unread = message_service.get_unread_count(user_id)

    return jsonify({
        "active_listings": active,
        "sold_listings": sold,
        "stats": {
            "active_count": len(active),
            "sold_count": len(sold),
            "unread_messages": unread,
        },
        "recent_messages": conversations[:5],
    })
