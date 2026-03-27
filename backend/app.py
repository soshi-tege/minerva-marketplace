import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.models import db
from backend.routes.auth import auth_bp
from backend.routes.items import items_bp
from backend.routes.messages import messages_bp
from backend.routes.dashboard import dashboard_bp


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///app.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "dev-secret-change-in-production"
    )

    db.init_app(app)
    JWTManager(app)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(port=5001, debug=True)
