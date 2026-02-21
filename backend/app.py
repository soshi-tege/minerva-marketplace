from flask import Flask, jsonify
from backend.routes.auth import auth_bp

app = Flask(__name__)

@app.get("/api/health")
def health():
    return jsonify(status="ok")

app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    app.run(debug=True)


