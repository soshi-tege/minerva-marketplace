import { useEffect, useState, useRef } from "react";
import { getConversations, getMessages, sendMessage, markConversationRead } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import emptyMessages from "../assets/empty-messages.svg";
import { Link } from "react-router-dom";

export default function Messages() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const pollingRef = useRef(null);

  useEffect(() => {
    getConversations().then((data) => {
      setConversations(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    if (!selectedConvo) return;
    const poll = () => {
      if (document.visibilityState === "hidden") return;
      getMessages(selectedConvo.id).then(setMessages);
    };
    pollingRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollingRef.current);
  }, [selectedConvo]);

  const selectConvo = (convo) => {
    setSelectedConvo(convo);
    getMessages(convo.id).then(setMessages);
    markConversationRead(convo.id);
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
            <div style={{ color: "#888", marginBottom: 16 }}>You have not chatted with anyone yet.</div>
            <Link to="/items" style={{ textDecoration: "none" }}>
              <Button style="btn-primary">Start browsing items</Button>
            </Link>
          </div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => selectConvo(c)}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "6px",
              background: selectedConvo?.id === c.id ? "#f3f3f3" : "transparent",
              marginBottom: "4px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{c.other_user}</p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>{c.item_title}</p>
            {c.last_message && (
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.last_message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card chat" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", minHeight: "400px" }}>
        {!selectedConvo ? (
          <p style={{ color: "#666", margin: "auto" }}>Select a conversation.</p>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender_id === currentUserId ? "flex-end" : "flex-start",
                    background: m.sender_id === currentUserId ? "#c0392b" : "#f0f0f0",
                    color: m.sender_id === currentUserId ? "white" : "#222",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "70%",
                    fontSize: "14px",
                  }}
                >
                  {m.body}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                style={{ flex: 1 }}
              />
              <button onClick={handleSend} className="btn-primary">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
