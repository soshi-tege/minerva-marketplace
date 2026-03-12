from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    items = db.relationship("Item", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"


class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    city = db.Column(db.String(100), nullable=False)
    listing_type = db.Column(db.String(50), nullable=False)  # offering / looking_for
    category = db.Column(db.String(100), nullable=False)

    price_cents = db.Column(db.Integer, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "city": self.city,
            "listing_type": self.listing_type,
            "category": self.category,
            "price_cents": self.price_cents,
            "created_at": self.created_at.isoformat(),
            "first_name": self.user.first_name if self.user else None,
        }

    def __repr__(self):
        return f"<Item {self.title}>"
    
    