import { useEffect, useState } from "react";
import { getConversations, getMessages, sendMessage } from "../services/api";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
  const currentUserId = storedUser?.id;

  useEffect(() => {
    getConversations().then((data) => {
      setConversations(Array.isArray(data) ? data : []);
    });
  }, []);

  const selectConvo = (convo) => {
    setSelectedConvo(convo);
    getMessages(convo.id).then(setMessages);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConvo) return;
    const msg = await sendMessage(selectedConvo.id, input);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="container messages" style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <div className="card conversations" style={{ width: "250px", padding: "1rem" }}>
        {conversations.length === 0 && <p>No conversations yet.</p>}
        {conversations.map((c) => (
          <div key={c.id} onClick={() => selectConvo(c)} style={{ cursor: "pointer", padding: "0.5rem", fontWeight: selectedConvo?.id === c.id ? "bold" : "normal" }}>
            <p><strong>{c.other_user}</strong></p>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>{c.item_title}</p>
          </div>
        ))}
      </div>
      <div className="card chat" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {!selectedConvo && <p>Select a conversation.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.sender_id === currentUserId ? "you" : ""}`} style={{ textAlign: m.sender_id === currentUserId ? "right" : "left" }}>
            {m.body}
          </div>
        ))}
        {selectedConvo && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." style={{ flex: 1 }} />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
