import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Body from '../components/Body';
import { loginUser } from '../services/authService';
export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user } = await loginUser(form);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <Body>
            <h2>Log In</h2>
            <form className="card" onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@minerva.edu"
                    required
                />
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in…' : 'Log In'}
                </button>
                <p>No account? <Link to="/register">Register here</Link></p>
            </form>
        </Body>
    );
}
