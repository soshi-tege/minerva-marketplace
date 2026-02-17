import React, { useEffect, useState } from "react";

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/items")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch items");
        }
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h2>Items</h2>
      <div className="grid">
        {items.map((item) => (
          <div key={item.id} className="card">
            <h3>{item.title}</h3>
            <p>City: {item.city}</p>
            <p>Type: {item.type}</p>
            <p>
              Price: {item.price ? `$${item.price}` : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Items;