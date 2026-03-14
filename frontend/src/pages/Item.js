import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";

const API_BASE = "http://localhost:5001/api";
const CATEGORIES = ["Appliance", "Furniture", "Electronics", "Textbooks", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function Item() {
  const { itemID } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  const token = storedUser?.token;
  const currentUserId = storedUser?.id;

  useEffect(() => {
    fetch(`${API_BASE}/items/${itemID}`)
      .then(r => r.json())
      .then(data => { setItem(data); setForm({ title: data.title, category: data.category, price: data.price / 100, condition: data.condition, location: data.location, description: data.description, status: data.status }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [itemID]);

  const handleContact = async () => {
    if (!token) { navigate("/login"); return; }
    await fetch(`${API_BASE}/messages/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item_id: parseInt(itemID) }),
    });
    navigate("/messages");
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API_BASE}/items/${itemID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price_cents: Math.round(form.price * 100) }),
    });
    const data = await res.json();
    setItem(data);
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <Body><p>Loading...</p></Body>;
  if (!item) return <Body><p>Item not found.</p></Body>;

  const isSeller = currentUserId === item.seller_id;

  return (
    <Body>
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        {editing ? (
          <>
            <Heading level={2}>Edit Listing</Heading>
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: "100%", marginBottom: 10 }} />
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: "100%", marginBottom: 10 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <label>Condition</label>
            <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={{ width: "100%", marginBottom: 10 }}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
            <label>Price ($)</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ width: "100%", marginBottom: 10 }} />
            <label>Location</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ width: "100%", marginBottom: 10 }} />
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{ width: "100%", marginBottom: 10 }} />
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: "100%", marginBottom: 16 }}>
              <option value="active">Active</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <Button onClick={handleSave} style="btn-primary">{saving ? "Saving..." : "Save changes"}</Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <Heading level={2}>{item.title}</Heading>
            <p><strong>${(item.price / 100).toFixed(2)} {item.currency}</strong> · {item.condition}</p>
            <p>{item.description}</p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>📍 {item.location}</p>
            <p style={{ fontSize: "13px", color: item.status === "active" ? "#27ae60" : "#888", fontWeight: 600, textTransform: "capitalize" }}>Status: {item.status}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {isSeller ? (
                <Button onClick={() => setEditing(true)} style="btn-primary">Edit listing</Button>
              ) : (
                <Button onClick={handleContact} style="btn-primary">Contact Seller</Button>
              )}
            </div>
          </>
        )}
      </div>
    </Body>
  );
}
