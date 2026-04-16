import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend import db, migrate
from backend.routes.auth import auth_bp
from backend.routes.items import items_bp
from backend.routes.messages import messages_bp
from backend.routes.dashboard import dashboard_bp

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///app.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    jwt_secret = os.environ.get("JWT_SECRET_KEY")
    if not jwt_secret and not app.config.get("TESTING"):
        logger.warning("JWT_SECRET_KEY not set — using insecure dev default. Do NOT use in production.")
        jwt_secret = "dev-secret-change-in-production"
    app.config["JWT_SECRET_KEY"] = jwt_secret or "test-secret"

    allowed_origins = os.environ.get("CORS_ORIGINS", "*")
    cors_origins = allowed_origins.split(",") if allowed_origins != "*" else "*"

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
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()

    logger.info("App created. Database: %s", app.config["SQLALCHEMY_DATABASE_URI"])
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    with app.app_context():
        db.create_all()
    app.run(port=port, debug=True)
