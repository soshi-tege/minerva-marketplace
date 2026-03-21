import API_BASE from '../config';

export const fetchItems = async () => {
    const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }
    return res.json();
};
