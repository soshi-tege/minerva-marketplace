import Body from "../components/Body"
import Button from "../components/Button"

export default function Messages() {
    return (
        <Body>
            <h2>List an Item</h2>
            <form class="card">
                <label>Photo</label><input type="file" />
                <label>Item Name</label><input placeholder="Microwave" />
                <label>Category</label><select>
                    <option>Appliance</option>
                </select>
                <label>Price</label><input placeholder="2000 or Free" />
                <label>Pickup By</label><input type="date" />
                <button>Post Listing</button>
            </form>
        </Body>
    )
}
