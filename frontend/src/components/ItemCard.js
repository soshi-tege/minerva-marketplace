import { Link } from "react-router-dom"

export default function ItemCard({ item }) {
    return (
        <div key={item.id} className="card item-card">
            <img src="https://via.placeholder.com/300x200" />
            <h3>{item.name}</h3>
            <p>City: {item.location}</p>
            <p>
                Price: {item.price ? `$${item.price}` : "N/A"}
            </p>
            <Link to={`/items/${item.id}`}>
                <button class="btn-primary">View</button>
            </Link>
        </div>
    )
}