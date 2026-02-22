import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const Register = ({ onToggle }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/register', formData);
            // Auto login after registration
            await login(formData.username, formData.password);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-card animated-auth"
        >
            <h2>Join ManageMind</h2>
            <p>Start your journey to becoming a management pro.</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <span className="input-icon">👤</span>
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <span className="input-icon">📧</span>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <span className="input-icon">🛡️</span>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <span className="input-icon">🔒</span>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                    {loading ? <Loader2 className="spinner" /> : 'Create Account'}
                </button>
            </form>
            <p className="auth-footer">
                Already have an account? <span onClick={onToggle}>Log In</span>
            </p>
        </motion.div>
    );
};

export default Register;
