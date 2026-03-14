from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Conversation, Message, Item

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")


@messages_bp.get("/conversations")
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())
    convos = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).all()
    result = []
    for c in convos:
        other = c.seller if c.buyer_id == user_id else c.buyer
        last_msg = c.messages[-1] if c.messages else None
        result.append({
            "id": c.id,
            "item_id": c.item_id,
            "item_title": c.item.title,
            "other_user": other.first_name,
            "last_message": last_msg.body if last_msg else None,
        })
    return jsonify(result)


@messages_bp.post("/conversations")
@jwt_required()
def start_conversation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    item = Item.query.get_or_404(data["item_id"])

    existing = Conversation.query.filter_by(
        item_id=item.id, buyer_id=user_id
    ).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    convo = Conversation(item_id=item.id, buyer_id=user_id, seller_id=item.seller_id)
    db.session.add(convo)
    db.session.commit()
    return jsonify(convo.to_dict()), 201


@messages_bp.get("/conversations/<int:convo_id>")
@jwt_required()
def get_messages(convo_id):
    convo = Conversation.query.get_or_404(convo_id)
    msgs = [m.to_dict() for m in convo.messages]
    return jsonify(msgs)


@messages_bp.post("/conversations/<int:convo_id>")
@jwt_required()
def send_message(convo_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    msg = Message(conversation_id=convo_id, sender_id=user_id, body=data["body"])
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201
