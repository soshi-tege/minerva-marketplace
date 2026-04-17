<<<<<<< HEAD
from sqlalchemy import func, or_
from sqlalchemy.orm import aliased, joinedload

from models import db, Conversation, Message, Item
=======
from datetime import datetime, timezone
from ..models import db, Conversation, Message, Item
>>>>>>> cc21b9857c8c8022e840485eb1e46cd8c017ebd9


def get_conversations(user_id):
    """Get all conversations for a user (as buyer or seller)."""
    convos = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).order_by(Conversation.created_at.desc()).all()

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


def send_message(convo_id, sender_id, body):
    """Send a message in a conversation."""
    msg = Message(conversation_id=convo_id, sender_id=sender_id, body=body)
    db.session.add(msg)
    db.session.commit()
    return msg


def get_unread_count(user_id):
    """Count unread messages for a user (messages sent by others with no read_at)."""
    count = Message.query.join(Conversation).filter(
        ((Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)),
        Message.sender_id != user_id,
        Message.read_at == None
    ).count()
    return count


def mark_conversation_read(convo_id, user_id):
    """Mark all messages in a conversation as read for this user."""
    messages = Message.query.filter_by(conversation_id=convo_id).filter(
        Message.sender_id != user_id,
        Message.read_at == None
    ).all()
    for msg in messages:
        msg.read_at = datetime.now(timezone.utc)
    db.session.commit()
