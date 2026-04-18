import React from "react";

export default function Toast({ notifications, onDismiss, onOpen }) {
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
          onClick={() => onOpen(n)}
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
          <div style={{ marginBottom: 10 }}>{n.message}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(n);
              }}
              style={{ padding: "4px 8px", fontSize: 12, background: "#c0392b" }}
            >
              Open
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(n.id);
              }}
              style={{ padding: "4px 8px", fontSize: 12, background: "#444" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
