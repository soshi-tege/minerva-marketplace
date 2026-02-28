import Body from "../components/Body"
import Button from "../components/Button"
import { useParams } from "react-router"

export default function Item() {
    const { itemID } = useParams();
    return (
        <Body>
            <p>Displaying information about {itemID}</p>
            <div class="card">
                <img src="https://via.placeholder.com/500x300" style={{ "width": "100%", "border-radius": "10px" }} />
                <h2>Rice Cooker</h2>
                <p><strong>¥1500</strong> · Like New</p>
                <p>Used for 3 months, works perfectly.</p>
                <Button>Contact Seller</Button>
            </div>
        </Body>
        
    )
}
