import API_BASE from "../config";

const getToken = () => {
  const u = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  return u?.token;
};

export const getConversations = async () => {
  const res = await fetch(`${API_BASE}/messages/conversations`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getMessages = async (convoId) => {
  const res = await fetch(`${API_BASE}/messages/conversations/${convoId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const sendMessage = async (convoId, body) => {
  const res = await fetch(`${API_BASE}/messages/conversations/${convoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ body }),
  });
  return res.json();
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_BASE}/messages/unread-count`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.unread_count ?? 0;
};

export const markConversationRead = async (convoId) => {
  await fetch(`${API_BASE}/messages/conversations/${convoId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};
