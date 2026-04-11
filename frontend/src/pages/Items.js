import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import Button from "../components/Button";
import API_BASE from "../config";
import emptyState from "../assets/empty-state.svg";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Appliance", "Furniture", "Electronics", "Textbooks", "Other"];
const SORTS = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Price (low → high)", value: "price_asc" },
    { label: "Price (high → low)", value: "price_desc" }
];

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("newest");

    function fetchItems(params = {}) {
        setLoading(true);
        setError("");
        const queryParams = {
            q: params.search ?? submittedSearch,
            sort: params.sort ?? sort,
        };
        const selectedCategory = params.category ?? category;
        if (selectedCategory !== "All") {
            queryParams.category = selectedCategory;
        }
        const query = new URLSearchParams(queryParams);
        fetch(`${API_BASE}/items?${query.toString()}`)
            .then(res => res.json())
            .then(data => { setItems(data.items || data || []); setLoading(false); })
            .catch(() => { setError("Could not load items."); setLoading(false); });
    }

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line
    }, [submittedSearch, category, sort]);

    function handleSearchSubmit(e) {
        e.preventDefault();
        setSubmittedSearch(search);
    }

    return (
        <div className="container">
            <h2 style={{ margin: "0 0 16px 0" }}>Browse items</h2>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                <input
                    name="search"
                    placeholder="Search items…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, minWidth: 180 }}
                />
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ borderRadius: 8, padding: "8px 12px" }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ borderRadius: 8, padding: "8px 12px" }}>
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <Button style="btn-primary" type="submit">Search</Button>
            </form>

            {loading && <p className="empty-state">Loading items...</p>}
            {error && <p className="empty-state" style={{ color: "#c0392b" }}>{error}</p>}
            {!loading && !error && items.length === 0 && (
                <div className="empty-state">
                    <img src={emptyState} alt="No items" style={{ width: 80, marginBottom: 16, opacity: 0.9 }} />
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>No listings yet</div>
                    <div style={{ color: '#888', marginBottom: 16 }}>Looks like there's nothing here yet.</div>
                    <Link to="/post" style={{ textDecoration: 'none' }}>
                        <Button style="btn-primary">Post an item</Button>
                    </Link>
                </div>
            )}

            <div className="grid">
                {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
        </div>
    );
}
