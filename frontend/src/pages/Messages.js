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
    <div className="container messages-layout">
      <div className="card convo-list">
        {conversations.length === 0 && (
          <div className="empty-state">
            <img src={emptyMessages} alt="No messages" className="empty-state-img" />
            <div className="empty-state-title">No messages yet</div>
            <div className="text-muted mb-12">You have not chatted with anyone yet.</div>
            <Link to="/items">
              <Button style="btn-primary">Start browsing items</Button>
            </Link>
          </div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => selectConvo(c)}
            className={`convo-item ${selectedConvo?.id === c.id ? "convo-item--selected" : ""}`}
          >
            <p className="convo-item-name">{c.other_user}</p>
            <p className="convo-item-title">{c.item_title}</p>
            {c.last_message && (
              <p className="convo-item-preview">{c.last_message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="card chat-area">
        {!selectedConvo ? (
          <p className="chat-placeholder">Select a conversation.</p>
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`chat-bubble ${m.sender_id === currentUserId ? "chat-bubble--mine" : "chat-bubble--theirs"}`}
                >
                  {m.body}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
              />
              <button onClick={handleSend} className="btn-primary">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
