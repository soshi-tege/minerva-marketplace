import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/items");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load items");
        } else {
          setItems(data.items || data || []);
        }
      } catch (err) {
        setError("Could not load items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  if (loading) {
    return <p>Loading items...</p>;
  }

  if (error) {
    return <p style={{ color: "#c0392b" }}>{error}</p>;
  }

  if (!items.length) {
    return <p>No items yet. Be the first to post something!</p>;
  }

  return (
    <div>
      <h2>Browse items</h2>
      <div className="grid">
        {items.map((item) => (
          <Link
            key={item.id || item._id}
            to={`/items/${item.id || item._id}`}
            className="card item-card"
            style={{ display: "block" }}
          >
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} />
            )}
            <h3>{item.title}</h3>
            {item.price != null && (
              <p style={{ fontWeight: 600 }}>${item.price}</p>
            )}
            {item.campus && (
              <p style={{ fontSize: 14, color: "#666" }}>{item.campus}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
