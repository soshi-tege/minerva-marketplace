from ..models import db, Conversation, Message, Item


def get_conversations(user_id):
    """Get all conversations for a user (as buyer or seller)."""
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
    convos = Conversation.query.filter(
        (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
    ).all()

    count = 0
    for c in convos:
        if c.messages and c.messages[-1].sender_id != user_id:
            count += 1
    return count
