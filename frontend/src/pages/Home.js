import { useState, useEffect } from ‘react’;
import { Link } from ‘react-router-dom’;
import Body from "../components/Body"
import ItemCard from "../components/ItemCard"
import Button from "../components/Button"
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import Heading from "../components/Heading"

export default function Home() {

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
        <Body>
            <div class="card">
                <h1>Leaving your dorm? Don’t throw it away.</h1>
                <p>Arriving? Get what you need from other Minervans.</p>
                <Heading level={2}>Browse Listings</Heading>
                <div class="grid">
                    {items.map((item) => (
                        <ItemCard item={item}></ItemCard>
                    ))}
                </div>
            </div>
            <h2>Browse Listings</h2>
            {loading && <p>Loading items...</p>}
            {error && <p>Could not load items: {error}</p>}
            {!loading && !error && <ItemList items={items} />}
        </Body>
    )
}
