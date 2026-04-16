import React from "react";

export default function Toast({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((n) => (
        <div key={n.id} onClick={() => onDismiss(n.id)} className="toast">
          <strong>New message</strong>
          {n.message}
        </div>
      ))}
    </div>
  );
}
