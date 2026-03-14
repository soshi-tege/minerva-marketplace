from datetime import datetime, timezone
from . import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    cohort = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    items = db.relationship("Item", back_populates="seller", lazy=True)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "first_name": self.first_name, "last_name": self.last_name, "city": self.city, "cohort": self.cohort, "created_at": self.created_at.isoformat()}

class Item(db.Model):
    __tablename__ = "items"
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="USD")
    category = db.Column(db.String(100), nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="active")
    location = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    seller = db.relationship("User", back_populates="items")

    def to_dict(self):
        return {"id": self.id, "seller_id": self.seller_id, "title": self.title, "description": self.description, "price": self.price, "currency": self.currency, "category": self.category, "condition": self.condition, "status": self.status, "location": self.location, "created_at": self.created_at.isoformat(), "updated_at": self.updated_at.isoformat()}

class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    item = db.relationship("Item", backref="conversations")
    buyer = db.relationship("User", foreign_keys=[buyer_id], backref="buying_conversations")
    seller = db.relationship("User", foreign_keys=[seller_id], backref="selling_conversations")
    messages = db.relationship("Message", back_populates="conversation", order_by="Message.created_at")

    def to_dict(self):
        return {"id": self.id, "item_id": self.item_id, "item_title": self.item.title, "buyer_id": self.buyer_id, "seller_id": self.seller_id, "created_at": self.created_at.isoformat()}

class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    conversation = db.relationship("Conversation", back_populates="messages")
    sender = db.relationship("User", backref="messages")

    def to_dict(self):
        return {"id": self.id, "conversation_id": self.conversation_id, "sender_id": self.sender_id, "sender_name": self.sender.first_name, "body": self.body, "created_at": self.created_at.isoformat()}
