import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login('admin');
        navigate('/admin-dashboard');
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card" style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                <h2 className="text-center" style={{ color: '#f87171' }}>Admin Console</h2>
                <p className="text-center text-gray-400 mb-4">System Administration</p>

                <form onSubmit={handleLogin}>
                    <div>
                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full mt-4" style={{ width: '100%', background: '#ef4444' }}>
                        Login as Admin
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a href="/login" className="text-sm text-gray-400 hover:text-white mr-4">Student Login</a>
                    <a href="/instructor-login" className="text-sm text-gray-400 hover:text-white">Instructor Login</a>
                </div>
            </div>
        </div>
    );
}
