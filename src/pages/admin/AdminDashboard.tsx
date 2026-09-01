import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Stats {
    students: number;
    instructors: number;
    active_cohorts: number;
    courses: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--index-primary-color)' }}>{stats?.students ?? 0}</h3>
                    <p style={{ color: 'var(--index-text-secondary)' }}>Active Students</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--lgl-cyan-dark)' }}>{stats?.instructors ?? 0}</h3>
                    <p style={{ color: 'var(--index-text-secondary)' }}>Instructors</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--lgl-success)' }}>{stats?.courses ?? 0}</h3>
                    <p style={{ color: 'var(--index-text-secondary)' }}>Active Courses</p>
                </div>
                <div className="glass-panel text-center">
                    <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--lgl-error)' }}>{stats?.active_cohorts ?? 0}</h3>
                    <p style={{ color: 'var(--index-text-secondary)' }}>Active Cohorts</p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <h3 className="flex-1" style={{ color: 'var(--index-text-heading)' }}>Platform Overview</h3>
            </div>

            <div className="glass-panel">
                <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--index-border-color)' }}>
                    <h4 style={{ color: 'var(--index-text-heading)', margin: 0 }}>Quick Actions</h4>
                    <span style={{ color: 'var(--lgl-success)' }}>&#9679; Operational</span>
                </div>
                <div className="flex gap-2">
                    <button style={{ background: 'transparent', border: '1px solid var(--index-border-color)', color: 'var(--index-text-heading)' }} onClick={() => navigate('/admin/users')}>Manage Users</button>
                    <button style={{ background: 'transparent', border: '1px solid var(--index-border-color)', color: 'var(--index-text-heading)' }} onClick={() => navigate('/admin/instructors')}>Manage Instructors</button>
                    <button style={{ background: 'transparent', border: '1px solid var(--index-border-color)', color: 'var(--index-text-heading)' }} onClick={() => navigate('/instructor/students')}>Manage Students</button>
                </div>
            </div>
        </div>
    );
}
