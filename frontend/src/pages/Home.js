import Body from "../components/Body"
import ItemCard from "../components/ItemCard"
import Button from "../components/Button"
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

export default function Home() {
    return (
        <Body>
            <div class="card" style={{ "background": "#c0392b" }}>
                <h1>Leaving your dorm? Don’t throw it away.</h1>
                <p>Arriving? Get what you need from other Minervans.</p>
                <Link to="browse">Browse Items</Link>
                <Link to="post">Sell an item</Link>
                <h2>Browse Listings</h2>
                <div class="grid">
                {/* display all items */}
                    <ItemCard itemID={1} />
                    <ItemCard itemID={1} />
                    <ItemCard itemID={1} />
                </div>
            </div>
        </Body>
    )
}
