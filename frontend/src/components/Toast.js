import React from "react";

export default function Toast({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: 1000,
    }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => onDismiss(n.id)}
          style={{
            background: "#222",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            maxWidth: "300px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontSize: "14px",
          }}
        >
          <strong style={{ display: "block", marginBottom: "2px" }}>
            New message
          </strong>
          {n.message}
        </div>
      ))}
    </div>
  );
}
