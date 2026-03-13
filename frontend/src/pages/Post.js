import Body from "../components/Body"
import Button from "../components/Button"
import Heading from "../components/Heading"

export default function Post() {
    return (
        <Body>
            <Heading level={2}>List an Item</Heading>
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
