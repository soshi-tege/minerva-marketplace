import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Body from "../components/Body";
import Heading from "../components/Heading";
import ItemCard from "../components/ItemCard";
import StatBox from "../components/StatBox";
import SectionCard from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export default function Dashboard() {
    const [stats, setStats] = useState({ active_count: 0, sold_count: 0, unread_messages: 0 });
    const [activeListings, setActiveListings] = useState([]);
    const [soldListings, setSoldListings] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const token = user?.token;

    useEffect(() => {
        apiFetch("/me/dashboard")
            .then(res => res.json())
            .then(data => {
                setStats(data.stats || { active_count: 0, sold_count: 0, unread_messages: 0 });
                setActiveListings(data.active_listings || []);
                setSoldListings(data.sold_listings || []);
                setRecentMessages(data.recent_messages || []);
                setLoading(false);
            })
            .catch(() => { setError("Could not load dashboard."); setLoading(false); });
    }, [token]);

    if (loading) return <Body><p>Loading...</p></Body>;
    if (error) return <Body><p className="text-error">{error}</p></Body>;

    return (
        <Body>
            <Heading level={2}>My Dashboard</Heading>

            <div className="stats-row">
                <StatBox label="Active Listings" value={stats.active_count} color="#2980b9" />
                <StatBox label="Sold Items" value={stats.sold_count} color="#27ae60" />
                <StatBox label="Unread Messages" value={stats.unread_messages} color="#c0392b" />
            </div>

            <SectionCard title="Active Listings">
                {activeListings.length === 0 ? (
                    <p className="text-muted">No active listings. <Link to="/post" className="text-error">Post something!</Link></p>
                ) : (
                    <div className="grid">
                        {activeListings.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Sold Items">
                {soldListings.length === 0 ? (
                    <p className="text-muted">No sold items yet.</p>
                ) : (
                    <div className="grid">
                        {soldListings.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Recent Messages">
                {recentMessages.length === 0 ? (
                    <p className="text-muted">No messages yet.</p>
                ) : (
                    <div className="recent-messages-list">
                        {recentMessages.map(m => (
                            <Link key={m.id} to="/messages" className="recent-message-item">
                                <div>
                                    <strong>{m.other_user}</strong>
                                    <p className="recent-message-preview">{m.last_message || "No messages yet"}</p>
                                </div>
                                <span className="recent-message-item-title">{m.item_title}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </SectionCard>
        </Body>
    );
}
