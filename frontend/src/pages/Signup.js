import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Sign up failed");
      } else {
        // Auto-log in after successful signup
        login({
          email: data.email,
          token: data.token,
        });
        navigate("/items");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Minerva email</label>
        <input
          id="email"
          type="email"
          placeholder="you@minerva.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          placeholder="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div style={{ color: "#c0392b", marginTop: 10 }}>{error}</div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 16, width: "100%" }}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
