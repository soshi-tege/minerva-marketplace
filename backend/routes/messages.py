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
    try:
        msg = message_service.send_message(convo_id, user_id, data["body"])
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    return jsonify(msg.to_dict()), 201


@messages_bp.put("/<int:msg_id>")
@jwt_required()
def edit_message(msg_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    try:
        msg = message_service.edit_message(msg_id, user_id, data.get("body", ""))
        return jsonify(msg.to_dict())
    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@messages_bp.delete("/<int:msg_id>")
@jwt_required()
def delete_message(msg_id):
    user_id = int(get_jwt_identity())
    try:
        message_service.delete_message(msg_id, user_id)
        return jsonify({"ok": True})
    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403


@messages_bp.get("/unread-count")
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = message_service.get_unread_count(user_id)
    return jsonify({"unread_count": count})


@messages_bp.post("/conversations/<int:convo_id>/read")
@jwt_required()
def mark_read(convo_id):
    user_id = int(get_jwt_identity())
    message_service.mark_conversation_read(convo_id, user_id)
    return jsonify({"ok": True})
