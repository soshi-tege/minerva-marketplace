import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="card home-hero">
        <h1>Buy and sell with other Minervans in your city!</h1>
        <p>
          Minerva Marketplace provides an easy, sustainable solution for buying and selling items between Minervans in your city.
        </p>
        <div className="home-btn-row">
          <Link to="/items" className="home-btn-link">
            <button className="btn-primary home-btn">Browse items</button>
          </Link>
          <Link to="/post" className="home-btn-link">
            <button className="home-btn btn-secondary">Post an item</button>
          </Link>
        </div>
      </section>
      <section className="grid home-features">
        <div className="card">
          <h3>For students, by students</h3>
          <p>Only students can list and buy, so you know who you are dealing with.</p>
        </div>
        <div className="card">
          <h3>Keep it on campus</h3>
          <p>Meet up in familiar spots.</p>
        </div>
        <div className="card">
          <h3>Give your stuff a second life</h3>
          <p>Turn unused items into cash, and help someone else out.</p>
        </div>
      </section>
    </div>
  );
}
