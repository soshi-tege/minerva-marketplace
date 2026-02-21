import Body from "../components/Body"
import ItemCard from "../components/ItemCard"
import Button from "../components/Button"
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

export default function Items() {
    return (
        <Body>
            <div class="card" style={{ "background": "#c0392b", "color": "white" }}>
                list of items
            </div>
        </Body>
    )
}
