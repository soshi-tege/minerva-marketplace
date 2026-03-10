from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dummy user database
users = []

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    users.append(data)
    return jsonify({"message": "User created!"}), 201
  
@app.route("/api/items")
def get_items():
    mock_items = [
        {
            "id": 1,
            "title": "Desk Lamp",
            "city": "Berlin",
            "type": "Offering",
            "price": 15
        },
        {
            "id": 2,
            "title": "Projector",
            "city": "Tokyo",
            "type": "Looking For",
            "price": None
        }
    ]
    return jsonify(mock_items)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    for user in users:
        if user["username"] == data["username"] and user["password"] == data["password"]:
            return jsonify({"message": "Login successful!"})
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)
app.register_blueprint(auth_bp, url_prefix="/api/auth")