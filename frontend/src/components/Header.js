<<<<<<< HEAD
import { Link } from "react-router-dom"

function Header() {
    return (
        <header>
            <div className="header-inner">
                <div className="logo">Minerva Marketplace</div>
                <nav className="nav">
                    <ul>
                        <li>
                            <Link to={`/`}>Home</Link>
                        </li>
                        <li>
                            <Link to={`/dashboard`}>Dashboard</Link>
                        </li>
                        <li>
                            <Link to={`/items`}>View Items</Link>
                        </li>
                        <li>
                            <Link to={`/post`}>Sell</Link>
                        </li>
                        <li>
                            <Link to={`/register`}>Register</Link>
                        </li>
                        <li>
                            <Link to={`/login`}>Login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
=======
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
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/items">
            Browse
          </NavLink>
          <NavLink to="/post">
            Post item
          </NavLink>
          <NavLink to="/messages">
            Messages
          </NavLink>
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
        </nav>

        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 14 }}>
                Signed in as <strong>{user?.username}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                style={{ background: "#eee" }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                Log in
              </NavLink>
              <NavLink to="/signup" className="btn-primary">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
>>>>>>> c34e2d7d (- implemented item fetching and display in Items page)
}

export default Header;