import { Link } from "react-router"

export default function ItemCard({ itemID }) {


    // find an item where the id is 1

    const exampleItem = {
        id: 1,
        name: "Mini Fridge",
        price: 20,
        location: "Tokyo",
    }
    
    const exampleItems = [exampleItem, exampleItem]

    return (
        <div class="card item-card"><img src="https://via.placeholder.com/300x200" />
            <h3>{exampleItem.name}</h3>
            <p>${exampleItem.price} · {exampleItem.location}</p>
            <Link to={`/items/${exampleItem.id}`}><button class="btn-primary">View</button></Link>
        </div>
    )
}