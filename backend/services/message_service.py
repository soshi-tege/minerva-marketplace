from datetime import datetime, timezone
from ..models import db, Conversation, Message, Item


def get_conversations(user_id):
    """Get all conversations for a user (as buyer or seller)."""
    convos = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).order_by(Conversation.created_at.desc()).all()

    result = []
    for c in convos:
        other = c.seller if c.buyer_id == user_id else c.buyer
        last_msg = next((m for m in reversed(c.messages) if not m.deleted_at), None)
        # Don't show empty conversations — only show after someone sends a message
        if not last_msg:
            continue
        result.append({
            "id": c.id,
            "item_id": c.item_id,
            "item_title": c.item.title,
            "other_user": other.first_name,
            "last_message": (last_msg.body or "") if last_msg else None,
            "last_message_has_image": bool(last_msg.image_url) if last_msg else False,
        })
    return result


def start_conversation(buyer_id, item_id):
    """Start a new conversation or return existing one."""
    item = Item.query.get_or_404(item_id)

    existing = Conversation.query.filter_by(
        item_id=item.id, buyer_id=buyer_id
    ).first()
    if existing:
        return existing, False

    convo = Conversation(item_id=item.id, buyer_id=buyer_id, seller_id=item.seller_id)
    db.session.add(convo)
    db.session.commit()
    return convo, True


def get_messages(convo_id):
    """Get all messages in a conversation."""
    convo = Conversation.query.get_or_404(convo_id)
    return [m.to_dict() for m in convo.messages]


def send_message(convo_id, sender_id, body="", image_url=None):
    """Send a message in a conversation. Verifies sender is a participant."""
    convo = Conversation.query.get_or_404(convo_id)
    if sender_id not in (convo.buyer_id, convo.seller_id):
        raise PermissionError("You are not a participant in this conversation.")
    text = (body or "").strip()
    if not text and not image_url:
        raise ValueError("Message body or image is required.")
    msg = Message(
        conversation_id=convo_id,
        sender_id=sender_id,
        body=text,
        image_url=image_url,
    )
    db.session.add(msg)
    db.session.commit()
    return msg


def get_unread_count(user_id):
    """Count unread messages for a user (messages sent by others with no read_at)."""
    count = Message.query.join(Conversation).filter(
        ((Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)),
        Message.sender_id != user_id,
        Message.read_at.is_(None)
    ).count()
    return count


def edit_message(msg_id, user_id, body):
    msg = Message.query.get_or_404(msg_id)
    if msg.sender_id != user_id:
        raise PermissionError()
    if not body.strip():
        raise ValueError("Message cannot be empty")
    msg.body = body.strip()
    db.session.commit()
    return msg


def delete_message(msg_id, user_id):
    msg = Message.query.get_or_404(msg_id)
    if msg.sender_id != user_id:
        raise PermissionError()
    msg.deleted_at = datetime.now(timezone.utc)
    db.session.commit()


def mark_conversation_read(convo_id, user_id):
    """Mark all messages in a conversation as read for this user."""
    messages = Message.query.filter_by(conversation_id=convo_id).filter(
        Message.sender_id != user_id,
        Message.read_at.is_(None)
    ).all()
    if not messages:
        return
    for msg in messages:
        msg.read_at = datetime.now(timezone.utc)
    db.session.commit()
