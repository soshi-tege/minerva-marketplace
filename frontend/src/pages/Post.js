import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../config";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Appliance",
  "Furniture",
  "Electronics",
  "Textbooks",
  "Kitchen",
  "Books",
  "Clothing",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const MINERVA_CITIES = [
  "San Francisco",
  "Buenos Aires",
  "Hyderabad",
  "Taipei",
  "Seoul",
  "Tokyo",
  "Berlin",
];

const EMPTY_FORM = {
  title: "",
  category: "",
  condition: "",
  price: "",
  budget: "",
  location: "",
  description: "",
};

export default function Post() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const resetFormState = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setImageFile(null);
    setError("");
    setLoading(false);
  };

  const handleListingTypeSelect = (type) => {
    resetFormState();
    setListingType(type);
  };

  const handleBack = () => {
    resetFormState();
    setListingType(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.category) errors.category = "Category is required.";
    if (!form.location) errors.location = "Location is required.";

    if (listingType === "offering") {
      if (!form.condition) errors.condition = "Please select a condition.";

      const trimmedPrice = form.price.trim();
      if (trimmedPrice === "") {
        errors.price = "Price is required.";
      } else {
        const priceNum = Number(trimmedPrice);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          errors.price = "Price must be a valid number.";
        }
      }
    }

    if (listingType === "request") {
      const trimmedBudget = form.budget.trim();
      if (trimmedBudget !== "") {
        const budgetNum = Number(trimmedBudget);
        if (!Number.isFinite(budgetNum) || budgetNum < 0) {
          errors.budget = "Budget must be a valid number.";
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!token) {
      setError("Please log in before posting an item.");
      return;
    }

    setLoading(true);

    try {
      const priceCents =
        form.price.trim().toLowerCase() === "free" || form.price.trim() === ""
          ? 0
          : isNaN(Number(form.price))
            ? 0
            : Math.round(Number(form.price) * 100);

      const token = user?.token;
      if (!token) {
        setError("Please log in before posting an item.");
        setLoading(false);
        return;
      }

      const body = new FormData();
      body.append("title", form.title.trim());
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (data.fields && typeof data.fields === "object") {
          setFieldErrors(data.fields);
        } else {
          setError(data.error || "Could not create listing.");
        }
        return;
      }

      resetFormState();
      navigate(data.id ? `/items/${data.id}` : "/items");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!listingType) {
    return (
      <Body>
        <Heading level={2}>What do you want to post?</Heading>
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <button
            className="btn btn-primary"
            onClick={() => handleListingTypeSelect("offering")}
            style={{ padding: "20px", fontSize: "1.1rem" }}
          >
            🛍️ I want to sell something
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleListingTypeSelect("request")}
            style={{ padding: "20px", fontSize: "1.1rem" }}
          >
            🔍 I&apos;m looking for something
          </button>
        </div>
      </Body>
    );
  }

  const isOffering = listingType === "offering";

  return (
    <Body>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}
      >
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#888",
            fontSize: "0.9rem",
          }}
        >
          ← Back
        </button>
        <Heading level={2} style={{ margin: 0 }}>
          {isOffering ? "Sell an item" : "Post a request"}
        </Heading>
      </div>

      <form className="card" onSubmit={handleSubmit} noValidate>
        {error && (
          <p style={{ color: "#c0392b", marginBottom: 12 }}>{error}</p>
        )}

        <label htmlFor="title">
          {isOffering ? "Item name" : "What are you looking for?"} *
        </label>
        <input
          id="title"
          name="title"
          placeholder={isOffering ? "e.g. Rice cooker" : "e.g. Desk lamp"}
          value={form.title}
          onChange={handleChange}
        />
        {fieldErrors.title && (
          <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>
            {fieldErrors.title}
          </p>
        )}

        <label htmlFor="category">Category *</label>
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
          <option value="Kitchen">Kitchen</option>
          <option value="Books">Books</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>
        {fieldErrors.category && (
          <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>
            {fieldErrors.category}
          </p>
        )}

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
          placeholder={
            isOffering
              ? "Any details buyers should know"
              : "Describe what you're looking for"
          }
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

        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Button style="btn-primary" disabled={loading}>
            {loading ? "Posting…" : isOffering ? "Post listing" : "Post request"}
          </Button>
        </div>
      </form>
    </Body>
  );
}