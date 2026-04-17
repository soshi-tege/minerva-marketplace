from sqlalchemy import func, or_
from sqlalchemy.orm import aliased, joinedload

from models import db, Conversation, Message, Item


def _latest_message_subquery():
    """Return latest message id per conversation."""
    return (
        db.session.query(
            Message.conversation_id.label("conversation_id"),
            func.max(Message.id).label("last_message_id"),
        )
        .group_by(Message.conversation_id)
        .subquery()
    )


def get_conversations(user_id):
    """Get all conversations for a user (as buyer or seller)."""
    latest_message_sq = _latest_message_subquery()
    last_message = aliased(Message)

    convos = (
        db.session.query(Conversation, last_message)
        .outerjoin(
            latest_message_sq,
            latest_message_sq.c.conversation_id == Conversation.id,
        )
        .outerjoin(last_message, last_message.id == latest_message_sq.c.last_message_id)
        .filter(or_(Conversation.buyer_id == user_id, Conversation.seller_id == user_id))
        .options(
            joinedload(Conversation.item),
            joinedload(Conversation.buyer),
            joinedload(Conversation.seller),
        )
        .order_by(Conversation.created_at.desc())
        .all()
    )

    result = []
    for c, last_msg in convos:
        other = c.seller if c.buyer_id == user_id else c.buyer
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
    """Count conversations with messages the user hasn't seen.
    Simple approach: count conversations where the last message was not sent by this user.
    """
    latest_message_sq = _latest_message_subquery()
    last_message = aliased(Message)

    count = (
        db.session.query(func.count(Conversation.id))
        .join(
            latest_message_sq,
            latest_message_sq.c.conversation_id == Conversation.id,
        )
        .join(last_message, last_message.id == latest_message_sq.c.last_message_id)
        .filter(or_(Conversation.buyer_id == user_id, Conversation.seller_id == user_id))
        .filter(last_message.sender_id != user_id)
        .scalar()
    )
    return count or 0
