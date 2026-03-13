import Body from "../components/Body"
import Heading from "../components/Heading"

export default function Dashboard() {
    return (
        <Body>
            <Heading level={2}>My Dashboard</Heading>
            <div class="card">
                <h3>My Listings</h3>
                <p>Mini Fridge – Available</p>
            </div>
            <div class="card" style={{ "margin-top": "20px" }}>
                <h3>Messages</h3>
                <p>Alex: Interested in Rice Cooker</p>
            </div>
        </Body>
    )
}
