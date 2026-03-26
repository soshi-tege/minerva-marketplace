from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Item, Message, Conversation

me_bp = Blueprint("me", __name__, url_prefix="/api/me")

@me_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user_id = int(get_jwt_identity())
    # Active listings
    active_items = Item.query.filter_by(seller_id=user_id, status="active").all()
    sold_items = Item.query.filter_by(seller_id=user_id, status="sold").all()
    # Quick stats
    num_active = len(active_items)
    num_sold = len(sold_items)
    num_messages = Message.query.join(Conversation).filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).count()
    # Recent messages (last 5 conversations)
    conversations = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).order_by(Conversation.created_at.desc()).limit(5).all()
    recent_messages = []
    for c in conversations:
        last_msg = c.messages[-1] if c.messages else None
        other = c.seller if c.buyer_id == user_id else c.buyer
        recent_messages.append({
            "id": c.id,
            "item_id": c.item_id,
            "item_title": c.item.title,
            "other_user": other.first_name,
            "last_message": last_msg.body if last_msg else None,
        })
    return jsonify({
        "active_listings": [i.to_dict() for i in active_items],
        "sold_items": [i.to_dict() for i in sold_items],
        "stats": {
            "active": num_active,
            "sold": num_sold,
            "messages": num_messages,
        },
        "recent_messages": recent_messages,
    })
