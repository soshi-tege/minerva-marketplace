import API_BASE from "../config";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Body from "../components/Body";
import Button from "../components/Button";
import Heading from "../components/Heading";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Appliance", "Furniture", "Electronics", "Textbooks", "Kitchen", "Books", "Clothing", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function Post() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step 1: user picks listing type first
  const [listingType, setListingType] = useState(null); // "offering" | "request"

  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    budget: "",
    location: "",
    description: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.category) errors.category = "Category is required.";
    if (!form.location.trim()) errors.location = "Location is required.";

    if (listingType === "offering") {
      if (!form.condition) errors.condition = "Please select a condition.";
      if (form.price.trim() === "") {
        errors.price = "Price is required.";
      } else if (isNaN(Number(form.price)) || Number(form.price) < 0) {
        errors.price = "Price must be a valid number.";
      }
    }

    if (listingType === "request") {
      if (form.budget.trim() !== "" && (isNaN(Number(form.budget)) || Number(form.budget) < 0)) {
        errors.budget = "Budget must be a valid number.";
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

    setLoading(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("mm_auth_user") || "{}");
      const token = storedUser?.token;

      // Build price_cents: for offerings use price field, for requests use budget (optional)
      let price_cents = 0;
      if (listingType === "offering") {
        price_cents = Math.round(Number(form.price) * 100);
      } else if (form.budget.trim() !== "") {
        price_cents = Math.round(Number(form.budget) * 100);
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim(),
        listing_type: listingType,
        price_cents,
        ...(listingType === "offering" && { condition: form.condition }),
      };

      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend returns field-level errors, show them
        if (data.fields) {
          setFieldErrors(data.fields);
        } else {
          setError(data.error || "Could not create listing.");
        }
      } else {
        navigate(data.id ? `/items/${data.id}` : "/items");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Pick listing type ──────────────────────────────
  if (!listingType) {
    return (
      <Body>
        <Heading level={2}>What do you want to post?</Heading>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            className="btn btn-primary"
            onClick={() => setListingType("offering")}
            style={{ padding: "20px", fontSize: "1.1rem" }}
          >
            🛍️ I want to sell something
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setListingType("request")}
            style={{ padding: "20px", fontSize: "1.1rem" }}
          >
            🔍 I'm looking for something
          </button>
        </div>
      </Body>
    );
  }

  // ── Step 2: The form ───────────────────────────────────────
  const isOffering = listingType === "offering";

  return (
    <Body>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button
          onClick={() => { setListingType(null); setFieldErrors({}); setError(""); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "0.9rem" }}
        >
          ← Back
        </button>
        <Heading level={2} style={{ margin: 0 }}>
          {isOffering ? "Sell an item" : "Post a request"}
        </Heading>
      </div>

      <form className="card" onSubmit={handleSubmit} noValidate>
        {error && <p style={{ color: "#c0392b", marginBottom: 12 }}>{error}</p>}

        {/* Title */}
        <label htmlFor="title">{isOffering ? "Item name" : "What are you looking for?"} *</label>
        <input
          id="title"
          name="title"
          placeholder={isOffering ? "e.g. Rice cooker" : "e.g. Desk lamp"}
          value={form.title}
          onChange={handleChange}
        />
        {fieldErrors.title && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.title}</p>}

        {/* Category */}
        <label htmlFor="category">Category *</label>
        <select id="category" name="category" value={form.category} onChange={handleChange}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {fieldErrors.category && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.category}</p>}

        {/* Condition — offerings only */}
        {isOffering && (
          <>
            <label htmlFor="condition">Condition *</label>
            <select id="condition" name="condition" value={form.condition} onChange={handleChange}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldErrors.condition && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.condition}</p>}
          </>
        )}

        {/* Price — offerings only */}
        {isOffering && (
          <>
            <label htmlFor="price">Price ($) *</label>
            <input
              id="price"
              name="price"
              placeholder="e.g. 25 (enter 0 for free)"
              value={form.price}
              onChange={handleChange}
            />
            {fieldErrors.price && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.price}</p>}
          </>
        )}

        {/* Budget — requests only (optional) */}
        {!isOffering && (
          <>
            <label htmlFor="budget">Maximum budget ($) <span style={{ color: "#888" }}>(optional)</span></label>
            <input
              id="budget"
              name="budget"
              placeholder="e.g. 50"
              value={form.budget}
              onChange={handleChange}
            />
            {fieldErrors.budget && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.budget}</p>}
          </>
        )}

        {/* Location */}
        <label htmlFor="location">Location *</label>
        <input
          id="location"
          name="location"
          placeholder="City or campus"
          value={form.location}
          onChange={handleChange}
        />
        {fieldErrors.location && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 2 }}>{fieldErrors.location}</p>}

        {/* Description */}
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder={isOffering ? "Any details buyers should know" : "Describe what you're looking for"}
          value={form.description}
          onChange={handleChange}
        />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button style="btn-primary">
            {loading ? "Posting…" : isOffering ? "Post listing" : "Post request"}
          </Button>
        </div>
      </form>
    </Body>
  );
}

