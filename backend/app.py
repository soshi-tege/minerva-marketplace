"""Flask application factory for Minerva Marketplace.

Creates and configures the Flask app with all extensions (SQLAlchemy,
Flask-Migrate, JWT, CORS) and registers the route blueprints.
"""

import logging
import os
from datetime import timedelta

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend import db, migrate
from backend.routes.auth import auth_bp
from backend.routes.items import items_bp
from backend.routes.messages import messages_bp
from backend.routes.dashboard import dashboard_bp

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def create_app(testing=False):
    """Create and configure the Flask application.

    Args:
        testing: When True, uses an in-memory SQLite database and a
                 fixed test secret. Skips the JWT_SECRET_KEY env var check.

    Returns:
        A configured Flask application instance.
    """
    app = Flask(__name__)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    message_upload_dir = os.path.join(base_dir, "static", "uploads", "messages")

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///app.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if testing:
        app.config["JWT_SECRET_KEY"] = "test-secret"
    else:
        jwt_secret = os.environ.get("JWT_SECRET_KEY")
        if not jwt_secret:
            logger.warning("JWT_SECRET_KEY not set — using insecure dev default. Do NOT use in production.")
            jwt_secret = "dev-secret-change-in-production"
        app.config["JWT_SECRET_KEY"] = jwt_secret

    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["TESTING"] = testing

    allowed_origins = os.environ.get("CORS_ORIGINS", "*")
    cors_origins = allowed_origins.split(",") if allowed_origins != "*" else "*"

    app.config["MESSAGE_UPLOAD_FOLDER"] = message_upload_dir

    db.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)
    CORS(app, origins=cors_origins)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/api/health")
    def health():
        """Return a simple health-check response."""
        return jsonify({"status": "ok"})

    @app.route("/uploads/messages/<path:filename>")
    def serve_message_upload(filename):
        """Serve locally-stored message images (dev only; prod uses Cloudinary)."""
        return send_from_directory(app.config["MESSAGE_UPLOAD_FOLDER"], filename)

    logger.info("App created. Database: %s", app.config["SQLALCHEMY_DATABASE_URI"])
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    with app.app_context():
        # Use Alembic migrations for schema management.
        # Run: flask db upgrade
        # For convenience in dev, create tables if none exist (fresh DB).
        from sqlalchemy import inspect as sa_inspect

        inspector = sa_inspect(db.engine)
        if not inspector.get_table_names():
            from flask_migrate import upgrade

            upgrade()
    app.run(port=port, debug=True)
