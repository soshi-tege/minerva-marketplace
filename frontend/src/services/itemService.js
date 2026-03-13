const API_BASE = 'http://localhost:5001/api';

export const fetchItems = async () => {
    const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }
    return res.json();
};
