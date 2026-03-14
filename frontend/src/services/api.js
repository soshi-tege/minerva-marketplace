const BASE_URL = "http://localhost:5001/api";

const getToken = () => { const u = JSON.parse(localStorage.getItem("mm_auth_user") || "{}"); return u?.token; };

export const getConversations = async () => {
  const res = await fetch(`${BASE_URL}/messages/conversations`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getMessages = async (convoId) => {
  const res = await fetch(`${BASE_URL}/messages/conversations/${convoId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const sendMessage = async (convoId, body) => {
  const res = await fetch(`${BASE_URL}/messages/conversations/${convoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ body }),
  });
  return res.json();
};
