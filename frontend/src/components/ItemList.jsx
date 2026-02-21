import ItemCard from './ItemCard';

export default function ItemList({ items }) {
    if (!items || items.length === 0) {
        return <p>No items available.</p>;
    }

    return (
        <div className="grid">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    );
}
