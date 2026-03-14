import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
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
