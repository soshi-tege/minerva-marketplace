import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Body from "../components/Body";
import Heading from "../components/Heading";

import API_BASE from "../config";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  const token = storedUser?.token;
  const userId = storedUser?.id;

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/items`).then(r => r.json()),
      fetch(`${API_BASE}/messages/conversations`, { headers }).then(r => r.json()),
    ]).then(([allItems, convos]) => {
      const myItems = (allItems.items || allItems || []).filter(i => i.seller_id === userId);
      setItems(myItems);
      setConversations(Array.isArray(convos) ? convos : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, userId]);

  if (loading) return <Body><p>Loading...</p></Body>;

  return (
    <Body>
      <Heading level={2}>My Dashboard</Heading>

      <div className="card" style={{ marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>My Listings</h3>
        {items.length === 0 && <p style={{ color: "#666" }}>No listings yet. <Link to="/post" style={{ color: "#c0392b" }}>Post something!</Link></p>}
        {items.map(item => (
          <Link key={item.id} to={`/items/${item.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "inherit" }}>
            <span>{item.title}</span>
            <span style={{ fontSize: "13px", color: item.status === "active" ? "#27ae60" : "#888", fontWeight: 600, textTransform: "capitalize" }}>{item.status}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Messages</h3>
        {conversations.length === 0 && <p style={{ color: "#666" }}>No messages yet.</p>}
        {conversations.map(c => (
          <Link key={c.id} to="/messages" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "inherit" }}>
            <div>
              <strong>{c.other_user}</strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{c.last_message || "No messages yet"}</p>
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>{c.item_title}</span>
          </Link>
        ))}
      </div>
    </Body>
  );
}
