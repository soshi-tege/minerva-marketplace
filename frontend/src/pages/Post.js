import API_BASE from "../config";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";

export default function Post() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Appliance",
    condition: "Good",
    price: "",
    location: "",
    pickupBy: "",
    purchasedFrom: "",
    purchasedYear: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
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
      const priceCents =
        form.price.trim().toLowerCase() === "free" || form.price.trim() === ""
          ? 0
          : isNaN(Number(form.price))
            ? 0
            : Math.round(Number(form.price) * 100);

      const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
      const token = storedUser?.token;
      if (!token) {
        setError("Please log in before posting an item.");
        setLoading(false);
        return;
      }

      const body = new FormData();
      body.append("title", form.title);
      body.append("category", form.category);
      body.append("condition", form.condition);
      body.append("location", form.location || "");
      body.append("description", form.description || "");
      body.append("pickup_by", form.pickupBy || "");
      body.append("price_cents", String(priceCents));
      body.append("purchased_from", form.purchasedFrom || "");
      body.append("purchased_year", form.purchasedYear || "");
      if (imageFile) {
        body.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
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

        <label htmlFor="condition">Condition</label>
        <select
          id="condition"
          name="condition"
          value={form.condition}
          onChange={handleChange}
        >
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>

        <label htmlFor="price">Price (USD)</label>
        <input
          id="price"
          name="price"
          placeholder="20.00 or Free"
          value={form.price}
          onChange={handleChange}
        />

        <label htmlFor="location">Location</label>
        <select id="location" name="location" value={form.location} onChange={handleChange} required>
          <option value="">Select your city</option>
          <option value="San Francisco">San Francisco</option>
          <option value="Buenos Aires">Buenos Aires</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Taipei">Taipei</option>
          <option value="Seoul">Seoul</option>
          <option value="Tokyo">Tokyo</option>
          <option value="Berlin">Berlin</option>
        </select>

        <label htmlFor="pickupBy">Pickup by</label>
        <input
          id="pickupBy"
          name="pickupBy"
          type="date"
          value={form.pickupBy}
          onChange={handleChange}
        />

        <label htmlFor="purchasedFrom">Where did you buy it? (optional)</label>
        <input
          id="purchasedFrom"
          name="purchasedFrom"
          placeholder="e.g. Amazon, IKEA, local store"
          value={form.purchasedFrom}
          onChange={handleChange}
        />

        <label htmlFor="purchasedYear">Year purchased (optional)</label>
        <input
          id="purchasedYear"
          name="purchasedYear"
          placeholder="e.g. 2023"
          maxLength={4}
          value={form.purchasedYear}
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

        <label htmlFor="image">Photo (optional)</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 8 }}
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
