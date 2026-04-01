
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Body from "../components/Body";
import Heading from "../components/Heading";
import ItemCard from "../components/ItemCard";

import API_BASE from "../config";

export default function Dashboard() {
  const [stats, setStats] = useState({ active: 0, sold: 0, messages: 0 });
  const [activeListings, setActiveListings] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  const token = storedUser?.token;

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE}/me/dashboard`, { headers })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats || { active: 0, sold: 0, messages: 0 });
        setActiveListings(data.active_listings || []);
        setSoldItems(data.sold_items || []);
        setRecentMessages(data.recent_messages || []);
        setLoading(false);
      })
      .catch(() => { setError("Could not load dashboard."); setLoading(false); });
  }, [token]);

  if (loading) return <Body><p>Loading...</p></Body>;
  if (error) return <Body><p style={{ color: "#c0392b" }}>{error}</p></Body>;

  return (
    <Body>
      <Heading level={2}>My Dashboard</Heading>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: 24 }}>
        <StatBox label="Active Listings" value={stats.active} color="#2980b9" />
        <StatBox label="Sold Items" value={stats.sold} color="#27ae60" />
        <StatBox label="Messages" value={stats.messages} color="#c0392b" />
      </div>

      {/* Active Listings */}
      <SectionCard title="Active Listings">
        {activeListings.length === 0 ? (
          <p style={{ color: "#666" }}>No active listings. <Link to="/post" style={{ color: "#c0392b" }}>Post something!</Link></p>
        ) : (
          <div className="grid">
            {activeListings.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </SectionCard>

      {/* Sold Items */}
      <SectionCard title="Sold Items">
        {soldItems.length === 0 ? (
          <p style={{ color: "#666" }}>No sold items yet.</p>
        ) : (
          <div className="grid">
            {soldItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </SectionCard>

      {/* Recent Messages */}
      <SectionCard title="Recent Messages">
        {recentMessages.length === 0 ? (
          <p style={{ color: "#666" }}>No messages yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentMessages.map(m => (
              <Link key={m.id} to="/messages" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "inherit" }}>
                <div>
                  <strong>{m.other_user}</strong>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{m.last_message || "No messages yet"}</p>
                </div>
                <span style={{ fontSize: "12px", color: "#999" }}>{m.item_title}</span>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </Body>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ minWidth: 120, background: color + "18", color, borderRadius: 10, padding: "18px 20px", fontWeight: 600, fontSize: 18, textAlign: "center", boxShadow: "0 1px 4px #0001" }}>
      <div style={{ fontSize: 28 }}>{value}</div>
      <div style={{ fontSize: 14 }}>{label}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}
