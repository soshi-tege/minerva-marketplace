import React, { useEffect, useState, useCallback } from "react";
import ItemCard from "../components/ItemCard";
import API_BASE from "../config";

const CATEGORIES = ["All", "Appliance", "Furniture", "Electronics", "Textbooks", "Kitchen", "Books", "Clothing", "Other"];
const PER_PAGE = 20;

export default function Items() {
  const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  const userCity = storedUser?.city || "";

  const [tab, setTab] = useState("offering");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState(userCity);
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/cities`)
      .then(r => r.json())
      .then(data => setCities(data))
      .catch(() => {});
  }, []);

  const buildUrl = useCallback((p) => {
    const params = new URLSearchParams({ listing_type: tab, page: p, per_page: PER_PAGE });
    if (appliedSearch) params.set("q", appliedSearch);
    if (category !== "All") params.set("category", category);
    if (city) params.set("city", city);
    return `${API_BASE}/items?${params}`;
  }, [tab, appliedSearch, category, city]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setError("");
    fetch(buildUrl(1))
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setHasMore(data.has_more || false);
        setLoading(false);
      })
      .catch(() => { setError("Could not load items."); setLoading(false); });
  }, [buildUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(search);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetch(buildUrl(nextPage))
      .then(r => r.json())
      .then(data => {
        setItems(prev => [...prev, ...(data.items || [])]);
        setHasMore(data.has_more || false);
        setPage(nextPage);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>Browse</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
            <input
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}
            />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: "6px", background: "#c0392b", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }}>Search</button>
          </form>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}>
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "2px solid #eee" }}>
        {[["offering", "Items for Sale"], ["request", "Requests"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: tab === val ? 700 : 400,
              color: tab === val ? "#c0392b" : "#666",
              borderBottom: tab === val ? "2px solid #c0392b" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      {!loading && !error && items.length === 0 && <p>No items found.</p>}

      <div className="grid">
        {items.map(item => <ItemCard key={item.id} item={item} />)}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{ padding: "10px 24px", borderRadius: "6px", background: "#c0392b", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
