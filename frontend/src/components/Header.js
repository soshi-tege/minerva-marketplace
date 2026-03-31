import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../services/api";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = () => {
      getUnreadCount().then(setUnreadCount);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
          <NavLink to="/messages">
            Messages{unreadCount > 0 && (
              <span style={{
                background: "#c0392b",
                color: "white",
                borderRadius: "10px",
                padding: "1px 6px",
                fontSize: "11px",
                marginLeft: "4px",
                fontWeight: 700,
              }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 14 }}>
                Hi, <strong>{user?.first_name}</strong>
              </span>
              <button type="button" onClick={logout} style={{ background: "#eee" }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/signup" className="btn-primary">Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
