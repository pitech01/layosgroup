import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForceOption, setShowForceOption] = useState(false);

    const handleLogin = async (e: React.FormEvent, isForce: boolean = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    role: 'admin',
                    force: isForce 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 423 && data.action_required === 'confirm_force_login') {
                    setShowForceOption(true);
                }
                throw new Error(data.message || 'Access Denied: Administrative credentials invalid.');
            }

            login(data.user, data.token);
            navigate('/admin-dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card" style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                <h2 className="text-center" style={{ color: '#f87171' }}>Admin Console</h2>
                <p className="text-center text-gray-400 mb-4">System Administration</p>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ marginBottom: showForceOption ? '0.5rem' : 0 }}>{error}</div>
                            {showForceOption && (
                                <button
                                    type="button"
                                    onClick={() => handleLogin(null as any, true)}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                                >
                                    SIGN OUT OTHERS & ENTER
                                </button>
                            )}
                        </div>
                    )}
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

                    <button type="submit" className="w-full mt-4" style={{ width: '100%', background: '#ef4444' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login as Admin'}
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
