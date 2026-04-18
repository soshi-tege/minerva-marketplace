import { Link } from "react-router-dom";
import { formatPriceCents, itemImageSrc } from "../config";

const CONDITION_COLORS = {
  "New": "#27ae60",
  "Like New": "#2980b9",
  "Good": "#f39c12",
  "Fair": "#888",
};

function timeAgo(dateString) {
  const now = new Date();
  const iso = dateString.endsWith("Z") ? dateString : dateString + "Z";
  const date = new Date(iso);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ItemCard({ item, currentUserId }) {
  const price = formatPriceCents(item.price);
  const conditionColor = CONDITION_COLORS[item.condition] || "#888";
  const isSold = item.status === "sold";
  const isOwn = currentUserId && item.seller_id === currentUserId;

  return (
    <Link to={`/items/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card item-card" style={{ cursor: "pointer", transition: "transform 0.15s", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        {isSold && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#2c3e50",
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: 999,
              padding: "4px 10px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Sold
          </span>
        )}
        {isOwn && !isSold && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#2980b9",
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: 999,
              padding: "4px 10px",
              letterSpacing: "0.04em",
            }}
          >
            Your listing
          </span>
        )}
        <img src={itemImageSrc(item.image_url)} alt={item.title} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{item.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#c0392b" }}>{price}</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: conditionColor, background: conditionColor + "18", padding: "2px 8px", borderRadius: "20px" }}>
            {item.condition}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#666" }}>📍 {item.location || "Unknown location"}</p>
          <span style={{ fontSize: "0.8rem", color: "#999" }}>{timeAgo(item.created_at)}</span>
        </div>
        {item.category && <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>{item.category}</p>}
      </div>
    </Link>
  );
}
