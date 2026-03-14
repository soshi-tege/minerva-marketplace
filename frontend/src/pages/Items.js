import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";

const CATEGORIES = ["All", "Appliance", "Furniture", "Electronics", "Textbooks", "Other"];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/items")
      .then(res => res.json())
      .then(data => { setItems(data.items || data || []); setLoading(false); })
      .catch(() => { setError("Could not load items."); setLoading(false); });
  }, []);

  const filtered = items.filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>Browse items</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>No items found. Be the first to post something!</p>}

      <div className="grid">
        {filtered.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
