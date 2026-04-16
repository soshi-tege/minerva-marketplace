import React, { useEffect, useState, useCallback } from "react";
import ItemCard from "../components/ItemCard";
import Button from "../components/Button";
import API_BASE from "../config";
import emptyState from "../assets/empty-state.svg";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Appliance", "Furniture", "Electronics", "Textbooks", "Kitchen", "Books", "Clothing", "Other"];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price (low \u2192 high)", value: "price_asc" },
  { label: "Price (high \u2192 low)", value: "price_desc" }
];
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
  const [sort, setSort] = useState("newest");
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
    const params = new URLSearchParams({ listing_type: tab, page: p, per_page: PER_PAGE, sort });
    if (appliedSearch) params.set("q", appliedSearch);
    if (category !== "All") params.set("category", category);
    if (city) params.set("city", city);
    return `${API_BASE}/items?${params}`;
  }, [tab, appliedSearch, category, sort, city]);

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
      <div className="browse-header">
        <h2>Browse</h2>
        <div className="browse-filters">
          <form onSubmit={handleSearch} className="browse-search">
            <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="filter-input" />
            <Button style="btn-primary" type="submit">Search</Button>
          </form>
          <select value={category} onChange={e => setCategory(e.target.value)} className="filter-input">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="filter-input">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} className="filter-input">
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="browse-tabs">
        {[["offering", "Items for Sale"], ["request", "Requests"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`browse-tab ${tab === val ? "browse-tab--active" : "browse-tab--inactive"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="empty-state">Loading items...</p>}
      {error && <p className="empty-state text-error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <img src={emptyState} alt="No items" className="empty-state-img" />
          <div className="empty-state-title">No listings yet</div>
          <div className="text-muted mb-12">Looks like there's nothing here yet.</div>
          <Link to="/post">
            <Button style="btn-primary">Post an item</Button>
          </Link>
        </div>
      )}

      <div className="grid">
        {items.map(item => <ItemCard key={item.id} item={item} currentUserId={storedUser?.id} />)}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button onClick={loadMore} disabled={loadingMore} className="btn-primary">
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
