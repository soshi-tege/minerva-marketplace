import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
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
      const res = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
      } else {
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
      <h2>Log in</h2>
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
          placeholder="Password"
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
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          No account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
