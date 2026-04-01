from ..models import db, Item

VALID_CATEGORIES = ["Appliance", "Furniture", "Electronics", "Textbooks", "Kitchen", "Books", "Clothing", "Other"]
VALID_CONDITIONS = ["New", "Like New", "Good", "Fair"]
VALID_LISTING_TYPES = ["offering", "request"]
VALID_SORT_OPTIONS = {"newest", "oldest", "price_asc", "price_desc"}


def validate_item_data(data, require_all=True):
    """Validate item fields. Used by both create and update.
    require_all=True for create, False for update (partial updates allowed).
    Returns (cleaned_data, errors) tuple.
    """
    errors = {}

    title = data.get("title", "").strip() if data.get("title") else ""
    if require_all and not title:
        errors["title"] = "Title is required."

    category = data.get("category", "").strip() if data.get("category") else ""
    if require_all and not category:
        errors["category"] = "Category is required."
    elif category and category not in VALID_CATEGORIES:
        errors["category"] = f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}"

    price_raw = data.get("price_cents")
    if require_all and price_raw is None:
        errors["price"] = "Price is required."
    elif price_raw is not None:
        try:
            price_raw = int(price_raw)
        except (ValueError, TypeError):
            errors["price"] = "Price must be a number."

    condition = data.get("condition", "")
    if condition and condition not in VALID_CONDITIONS:
        errors["condition"] = f"Invalid condition. Must be one of: {', '.join(VALID_CONDITIONS)}"

    listing_type = data.get("listing_type", "")
    if listing_type and listing_type not in VALID_LISTING_TYPES:
        errors["listing_type"] = "Must be 'offering' or 'request'."

    location = data.get("location", "").strip() if data.get("location") else ""
    if require_all and not location:
        errors["location"] = "Location is required."

    return errors


def list_items(city=None, listing_type=None, category=None, q=None, sort="newest", page=1, per_page=20):
    """Query items with composable filters, search, sort, and pagination."""
    query = Item.query

    if city:
        query = query.filter(Item.location == city)
    if listing_type:
        query = query.filter(Item.listing_type == listing_type)
    if category:
        query = query.filter(Item.category == category)
    if q:
        pattern = f"%{q}%"
        query = query.filter(Item.title.ilike(pattern) | Item.description.ilike(pattern))

    if sort == "oldest":
        query = query.order_by(Item.created_at.asc())
    elif sort == "price_asc":
        query = query.order_by(Item.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Item.price.desc())
    else:
        query = query.order_by(Item.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [item.to_dict() for item in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "has_more": (page * per_page) < total,
    }


def get_item(item_id):
    """Get a single item by ID."""
    return Item.query.get_or_404(item_id)


def create_item(seller_id, data):
    """Create a new item listing."""
    item = Item(
        seller_id=seller_id,
        title=data.get("title", "").strip(),
        category=data.get("category", "").strip(),
        price=int(data.get("price_cents", 0)),
        currency="USD",
        condition=data.get("condition", "Good"),
        listing_type=data.get("listing_type", "offering"),
        location=data.get("location", "").strip(),
        description=data.get("description", "").strip(),
        image_url=data.get("image_url"),
    )
    db.session.add(item)
    db.session.commit()
    return item


def update_item(item, data):
    """Update an existing item with provided fields."""
    if "title" in data:
        item.title = data["title"]
    if "category" in data:
        item.category = data["category"]
    if "price_cents" in data:
        item.price = int(data["price_cents"])
    if "condition" in data:
        item.condition = data["condition"]
    if "location" in data:
        item.location = data["location"]
    if "description" in data:
        item.description = data["description"]
    if "status" in data:
        item.status = data["status"]
    if "listing_type" in data:
        item.listing_type = data["listing_type"]
    if "image_url" in data:
        item.image_url = data["image_url"]
    db.session.commit()
    return item


def delete_item(item):
    """Delete an item."""
    db.session.delete(item)
    db.session.commit()


def get_categories():
    """Return the list of valid categories."""
    return VALID_CATEGORIES
