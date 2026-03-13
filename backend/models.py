from datetime import datetime, timezone
import bcrypt
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
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    items = db.relationship("Item", back_populates="seller", lazy=True)
    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "city": self.city,
            "cohort": self.cohort,
            "created_at": self.created_at.isoformat(),
        }

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
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    seller = db.relationship("User", back_populates="items")
    def to_dict(self):
        return {
            "id": self.id,
            "seller_id": self.seller_id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "currency": self.currency,
            "category": self.category,
            "condition": self.condition,
            "status": self.status,
            "location": self.location,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
