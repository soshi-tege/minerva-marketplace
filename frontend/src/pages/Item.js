import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";

const API_BASE = "http://localhost:5001/api";

export default function Item() {
  const { itemID } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/items/${itemID}`)
      .then((res) => res.json())
      .then((data) => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [itemID]);

  const handleContact = async () => {
    const token = JSON.parse(localStorage.getItem("mm_auth_user") || "{}")?.token;
    if (!token) { navigate("/login"); return; }
    await fetch(`${API_BASE}/messages/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ item_id: parseInt(itemID) }),
    });
    navigate("/messages");
  };

  if (loading) return <Body><p>Loading...</p></Body>;
  if (!item) return <Body><p>Item not found.</p></Body>;

  return (
    <Body>
      <div className="card">
        <Heading level={2}>{item.title}</Heading>
        <p><strong>{item.price} {item.currency}</strong> · {item.condition}</p>
        <p>{item.description}</p>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>{item.location}</p>
        <Button onClick={handleContact}>Contact Seller</Button>
      </div>
    </Body>
  );
}
