import { Link } from "react-router-dom";
import { itemImageSrc } from "../apiConfig";

const CONDITION_COLORS = {
  "New": "#27ae60",
  "Like New": "#2980b9",
  "Good": "#f39c12",
  "Fair": "#888",
};

export default function ItemCard({ item }) {
  const price = item.price === 0 ? "Free" : `$${(item.price / 100).toFixed(2)}`;
  const conditionColor = CONDITION_COLORS[item.condition] || "#888";
  const isSold = item.status === "sold";

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
        <img src={itemImageSrc(item.image_url)} alt={item.title} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{item.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#c0392b" }}>{price}</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: conditionColor, background: conditionColor + "18", padding: "2px 8px", borderRadius: "20px" }}>
            {item.condition}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>📍 {item.location || "Unknown location"}</p>
        {item.category && <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>{item.category}</p>}
      </div>
    </Link>
  );
}
