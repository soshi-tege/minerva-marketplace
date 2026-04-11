import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header>
      <div className="header-inner">
        <Link to="/" className="logo">
          Minerva Marketplace
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/items">Browse</NavLink>
          <NavLink to="/post">Post item</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        <div className="nav-auth">
          <button type="button" className="theme-toggle" onClick={() => setDark(d => !d)} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
          </button>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 14 }}>
                Hi, <strong>{user?.first_name}</strong>
              </span>
              <button type="button" onClick={logout} style={{ background: "var(--secondary-btn)", color: "var(--secondary-btn-text)" }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/signup">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
