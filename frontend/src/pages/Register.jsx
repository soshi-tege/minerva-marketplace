import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Body from '../components/Body';
import { registerUser } from '../services/authService';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
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
            const { token, user } = await registerUser(form);
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
            <h2>Create Account</h2>
            <form className="card" onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <label>First Name</label>
                <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    required
                />

                <label>Last Name</label>
                <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                />

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
                    {loading ? 'Creating account…' : 'Register'}
                </button>

                <p>Already have an account? <Link to="/login">Log in</Link></p>
            </form>
        </Body>
    );
}
