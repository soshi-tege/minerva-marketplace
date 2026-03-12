import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="card" style={{ marginBottom: 32 }}>
        <h1>Buy and sell with other Minervans in your city!</h1>
        <p style={{ marginTop: 8, maxWidth: 520 }}>
          Minerva Marketplace provides an easy, sustainable solution for buying and selling items between Minervans in your city.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/items">
            <button className="btn-primary">Browse items</button>
          </Link>
          <Link to="/post">
            <button style={{ background: "#eee" }}>Post an item</button>
          </Link>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h3>For students, by students</h3>
          <p style={{ marginTop: 8 }}>
            Only students can list and buy, so you know who you are dealing with.
          </p>
        </div>
        <div className="card">
          <h3>Keep it on campus</h3>
          <p style={{ marginTop: 8 }}>
            Meet up in familiar spots.
          </p>
        </div>
        <div className="card">
          <h3>Give your stuff a second life</h3>
          <p style={{ marginTop: 8 }}>
            Turn unused items into cash, and help someone else out.
          </p>
        </div>
      </section>
    </div>
  );
}
