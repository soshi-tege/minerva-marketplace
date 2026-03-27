from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import message_service

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")


@messages_bp.get("/conversations")
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())
    result = message_service.get_conversations(user_id)
    return jsonify(result)


@messages_bp.post("/conversations")
@jwt_required()
def start_conversation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    convo, created = message_service.start_conversation(user_id, data["item_id"])
    return jsonify(convo.to_dict()), 201 if created else 200


@messages_bp.get("/conversations/<int:convo_id>")
@jwt_required()
def get_messages(convo_id):
    msgs = message_service.get_messages(convo_id)
    return jsonify(msgs)


@messages_bp.post("/conversations/<int:convo_id>")
@jwt_required()
def send_message(convo_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    msg = message_service.send_message(convo_id, user_id, data["body"])
    return jsonify(msg.to_dict()), 201


@messages_bp.get("/unread-count")
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = message_service.get_unread_count(user_id)
    return jsonify({"unread_count": count})
