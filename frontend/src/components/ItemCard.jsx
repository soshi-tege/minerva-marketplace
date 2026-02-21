import { Link } from "react-router"

export default function ItemCard({ item }) {
    return (
        <div className="card item-card">
            <img src="https://via.placeholder.com/300x200" alt={item.title} />
            <h3>{item.title}</h3>
            <p>¥{item.price} · {item.location}</p>
            <Link to={`/items/${item.id}`}><button className="btn-primary">View</button></Link>
        </div>
    )
}