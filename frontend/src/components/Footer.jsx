export default function Footer() {
    return (
        <footer style={{ textAlign: 'center', padding: '1rem', marginTop: '2rem', borderTop: '1px solid #ddd' }}>
            <p>© {new Date().getFullYear()} Minerva Exchange. All rights reserved.</p>
        </footer>
    );
}
