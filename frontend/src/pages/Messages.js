import { useEffect, useState } from "react";
import { getConversations, getMessages, sendMessage } from "../services/api";
import Button from "../components/Button";
import emptyMessages from "../assets/empty-messages.svg";
import { Link } from "react-router-dom";

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
        {conversations.length === 0 && (
          <div className="empty-state">
            <img src={emptyMessages} alt="No messages" style={{ width: 80, marginBottom: 16, opacity: 0.9 }} />
            <div style={{ fontWeight: 500, marginBottom: 8 }}>No messages yet</div>
            <div style={{ color: '#888', marginBottom: 16 }}>You haven’t chatted with anyone yet.</div>
            <Link to="/items" style={{ textDecoration: 'none' }}>
              <Button style="btn-primary">Start browsing items</Button>
            </Link>
          </div>
        )}
        {conversations.map((c) => (
          <div key={c.id} onClick={() => selectConvo(c)} style={{ cursor: "pointer", padding: "0.5rem", fontWeight: selectedConvo?.id === c.id ? "bold" : "normal" }}>
            <p><strong>{c.other_user}</strong></p>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>{c.item_title}</p>
          </div>
        ))}
      </div>
      <div className="card chat" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {!selectedConvo && <p className="empty-state">Select a conversation.</p>}
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
