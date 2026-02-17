from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow all origins (dev only)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

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

if __name__ == "__main__":
    app.run(port=5001, debug=True)