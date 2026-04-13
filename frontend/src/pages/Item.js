import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";
import API_BASE, { formatPriceCents, itemImageSrc } from "../config";
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
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editError, setEditError] = useState("");

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
    if (!token) return;
    setEditError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/items/${itemID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price_cents: Math.round(form.price * 100) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItem(data);
        setEditing(false);
      } else {
        setEditError(data.error || "Could not save changes. Please try again.");
      }
    } catch {
      setEditError("Could not save changes. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditing = () => {
    if (!item) return;
    setEditError("");
    setForm({
      title: item.title || "",
      category: item.category || CATEGORIES[0],
      price: (item.price || 0) / 100,
      condition: item.condition || CONDITIONS[0],
      location: item.location || "",
      description: item.description || "",
      status: item.status || "active",
    });
    setEditing(true);
  };

  const handleMarkAsSold = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/items/${itemID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "sold" }),
      });
      const data = await res.json();
      if (res.ok) {
        setItem(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    const confirmed = window.confirm("Delete this listing? This action cannot be undone.");
    if (!confirmed) return;

    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/items/${itemID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate("/dashboard");
      } else {
        const payload = await res.json().catch(() => ({}));
        setDeleteError(payload.error || "Could not delete listing. Please try again.");
      }
    } catch {
      setDeleteError("Could not delete listing. Please check your connection and try again.");
    } finally {
      setDeleting(false);
    }
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
            {editError && (
              <p style={{ color: "#c0392b", marginBottom: 12 }}>{editError}</p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Button onClick={handleSave} style="btn-primary">{saving ? "Saving..." : "Save changes"}</Button>
              <Button onClick={() => { setEditing(false); setEditError(""); }}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <img
              src={itemImageSrc(item.image_url)}
              alt=""
              style={{
                width: "100%",
                maxHeight: 280,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
            <Heading level={2}>{item.title}</Heading>
            <p><strong>{formatPriceCents(item.price)}</strong> · {item.condition}</p>
            <p>{item.description}</p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>📍 {item.location}</p>
            <p style={{ fontSize: "13px", color: item.status === "active" ? "#27ae60" : "#888", fontWeight: 600, textTransform: "capitalize" }}>Status: {item.status}</p>
            {deleteError && (
              <p style={{ color: "#c0392b", marginTop: 8 }}>{deleteError}</p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {isSeller ? (
                <>
                  <Button onClick={handleStartEditing} style="btn-primary">Edit listing</Button>
                  {item.status !== "sold" && (
                    <Button onClick={handleMarkAsSold}>
                      {saving ? "Updating..." : "Mark as sold"}
                    </Button>
                  )}
                  <Button onClick={handleDelete} style="btn-danger">
                    {deleting ? "Deleting..." : "Delete listing"}
                  </Button>
                </>
              ) : (
                item.status !== "sold" && (
                  <Button onClick={handleContact} style="btn-primary">Contact Seller</Button>
                )
              )}
            </div>
            {item.seller && (
              <div style={{ marginTop: 24, padding: "16px", background: "#f9f9f9", borderRadius: "8px", borderTop: "1px solid #eee" }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>Seller</p>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>{item.seller.first_name} {item.seller.last_name}</p>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#666" }}>{item.seller.city} · Cohort {item.seller.cohort}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>Member since {new Date(item.seller.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Body>
  );
}
