import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";
import { useAuth } from "../context/AuthContext";

export default function Post() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    category: "Appliance",
    price: "",
    location: "",
    pickupBy: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        category: form.category,
        location: form.location,
        description: form.description,
        pickup_by: form.pickupBy || null,
        // basic price handling: empty or "free" -> 0
        price_cents:
          form.price.trim().toLowerCase() === "free" || form.price.trim() === ""
            ? 0
            : Math.round(Number(form.price) * 100),
        // TODO: seller/user linkage when backend is ready
        seller_email: user?.email || null,
      };

      const res = await fetch("http://127.0.0.1:5001/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create listing.");
      } else {
        setSuccess("Listing created!");
        // If backend returns the new item id, you can redirect there
        if (data.id) {
          navigate(`/items/${data.id}`);
        } else {
          navigate("/items");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Body>
      <Heading level={2}>List an item</Heading>
      <form className="card" onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: "#c0392b", marginBottom: 12 }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "green", marginBottom: 12 }}>{success}</p>
        )}

        <label htmlFor="title">Item name</label>
        <input
          id="title"
          name="title"
          placeholder="Microwave"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="Appliance">Appliance</option>
          <option value="Furniture">Furniture</option>
          <option value="Electronics">Electronics</option>
          <option value="Textbooks">Textbooks</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          placeholder="2000 or Free"
          value={form.price}
          onChange={handleChange}
        />

        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          placeholder="City or campus"
          value={form.location}
          onChange={handleChange}
        />

        <label htmlFor="pickupBy">Pickup by</label>
        <input
          id="pickupBy"
          name="pickupBy"
          type="date"
          value={form.pickupBy}
          onChange={handleChange}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Any details buyers should know"
          value={form.description}
          onChange={handleChange}
        />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button style="btn-primary">
            {loading ? "Posting…" : "Post listing"}
          </Button>
        </div>
      </form>
    </Body>
  );
}
