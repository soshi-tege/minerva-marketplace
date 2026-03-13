import { useState, useEffect } from ‘react’;
import { Link } from ‘react-router-dom’;
import Body from "../components/Body"
import ItemList from "../components/ItemList"
import { fetchItems } from "../services/itemService"

export default function Home() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchItems()
            .then(setItems)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Body>
            <div className="card" style={{ "background": "#c0392b" }}>
                <h1>Leaving your dorm? Don’t throw it away.</h1>
                <p>Arriving? Get what you need from other Minervans.</p>
                <Link to="browse">Browse Items</Link>
                <Link to="post">Sell an item</Link>
            </div>
            <h2>Browse Listings</h2>
            {loading && <p>Loading items...</p>}
            {error && <p>Could not load items: {error}</p>}
            {!loading && !error && <ItemList items={items} />}
        </Body>
    )
}
