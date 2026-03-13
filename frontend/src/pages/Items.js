import React, { useEffect, useState } from "react";
import { Link } from "react-router"
import Heading from "../components/Heading"
import ItemCard from "../components/ItemCard";

function Items() {

    // Activate when the backend is ready

    //   const [items, setItems] = useState([]);
    //   const [loading, setLoading] = useState(true);
    //   const [error, setError] = useState(null);

    //   useEffect(() => {
    //     fetch("http://127.0.0.1:5001/api/items")
    //       .then((res) => {
    //         if (!res.ok) {
    //           throw new Error("Failed to fetch items");
    //         }
    //         return res.json();
    //       })
    //       .then((data) => {
    //         setItems(data);
    //         setLoading(false);
    //       })
    //       .catch((err) => {
    //         setError(err.message);
    //         setLoading(false);
    //       });
    //   }, []);

    // if (loading) return <div className="container">Loading...</div>;
    // if (error) return <div className="container">Error: {error}</div>;



    const items = [
        {
            id: 1,
            name: "Mini Fridge",
            price: 20,
            location: "Tokyo",
        },
        {
            id: 1,
            name: "Mini Fridge",
            price: 20,
            location: "Tokyo",
        },
        {
            id: 1,
            name: "Mini Fridge",
            price: 20,
            location: "Tokyo",
        },
    ]

    return (
        <div className="container">
            <Heading level={2}>Items</Heading>
            <div className="grid">
                {items.map((item) => (
                    <ItemCard item={item}></ItemCard>
                ))}
            </div>
        </div>
    );
}

export default Items;
