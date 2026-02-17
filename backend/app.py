#this is just dummy code for testing purposes

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

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    for user in users:
        if user["username"] == data["username"] and user["password"] == data["password"]:
            return jsonify({"message": "Login successful!"})
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)
