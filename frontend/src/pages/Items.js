import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import Button from "../components/Button";
const CATEGORIES = ["All", "Appliance", "Furniture", "Electronics", "Textbooks", "Other"];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Price (low → high)", value: "price_asc" },
  { label: "Price (high → low)", value: "price_desc" }
];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [listingType, setListingType] = useState("offering");

  function fetchItems(params = {}) {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({
      search: params.search ?? search,
      category: params.category ?? (category === "All" ? "" : category),
      sort: params.sort ?? sort,
      listing_type: params.listingType ?? listingType
    });
    fetch(`http://127.0.0.1:5001/api/items?${query.toString()}`)
      .then(res => res.json())
      .then(data => { setItems(data.items || data || []); setLoading(false); })
      .catch(() => { setError("Could not load items."); setLoading(false); });
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [search, category, sort, listingType]);

  function handleSearchChange(e) {
    setSearch(e.target.value);
  }
  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchItems({ search: e.target.search.value });
  }
  function handleCategoryChange(e) {
    setCategory(e.target.value);
  }
  function handleSortChange(e) {
    setSort(e.target.value);
  }
  function handleTab(type) {
    setListingType(type);
  }

  return (
    <div className="container">
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <Button style={listingType === "offering" ? "btn-primary" : ""} onClick={() => handleTab("offering")}>Offerings</Button>
        <Button style={listingType === "request" ? "btn-primary" : ""} onClick={() => handleTab("request")}>Requests</Button>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: "flex", gap: 8, minWidth: 220 }}>
          <input
            name="search"
            placeholder="Search items…"
            value={search}
            onChange={handleSearchChange}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15 }}
          />
          <select value={category} onChange={handleCategoryChange} style={{ borderRadius: 8, padding: "8px 12px" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={handleSortChange} style={{ borderRadius: 8, padding: "8px 12px" }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Button style="btn-primary" type="submit">Search</Button>
        </form>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      {!loading && !error && items.length === 0 && <p>No items found. Be the first to post something!</p>}

      <div className="grid">
        {items.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
