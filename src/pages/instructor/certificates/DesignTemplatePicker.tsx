import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Loader2, AlertCircle, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Cohort {
    id: string;
    name: string;
    instructor_id: number;
    course?: { title: string };
}

export default function DesignTemplatePicker() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCohorts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/cohorts`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 401) {
                    logout();
                    navigate('/instructor-login');
                    return;
                }

                const data = await response.json();
                if (response.ok) {
                    const filtered = data.filter((c: Cohort) => String(c.instructor_id) === String(user?.id));
                    setCohorts(filtered);
                } else {
                    throw new Error(data.message || 'Failed to load cohorts.');
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load cohorts.';
                if (message === 'Failed to fetch' || message.includes('NetworkError')) {
                    toast.error('Connection failed.');
                } else {
                    setError(message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCohorts();
    }, [user?.id]);

    const filteredCohorts = cohorts.filter((c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="design-picker-container animate-fade-in">
            <style>{`
                .staff-scope .design-picker-container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
                .staff-scope .picker-header { margin-bottom: 2.5rem; }
                .staff-scope .picker-header h1 { font-size: 2.25rem; font-weight: 950; color: var(--index-text-heading); letter-spacing: -0.04em; margin: 0 0 0.5rem 0; }
                .staff-scope .picker-header p { color: var(--index-text-secondary); font-size: 1.05rem; font-weight: 600; margin: 0; }
                .staff-scope .picker-search { width: 100%; height: 56px; background: var(--index-hover-bg); border: 2px solid var(--index-hover-bg); border-radius: 16px; padding: 0 1.25rem; font-size: 1rem; font-weight: 600; color: var(--index-text-heading); box-sizing: border-box; margin-bottom: 2rem; }
                .staff-scope .picker-search:focus { background: white; border-color: var(--index-primary-color); outline: none; }
                .staff-scope .picker-list { display: flex; flex-direction: column; gap: 1rem; }
                .staff-scope .picker-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; background: white; border: 1.5px solid var(--index-hover-bg); border-radius: 20px; padding: 1.5rem 1.75rem; text-decoration: none; transition: all 0.2s; }
                .staff-scope .picker-row:hover { border-color: var(--index-primary-color); box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--index-primary-color) 10%, transparent); }
                .staff-scope .picker-row-title { font-weight: 900; color: var(--index-text-heading); font-size: 1.05rem; margin-bottom: 0.25rem; }
                .staff-scope .picker-row-sub { font-size: 0.85rem; color: var(--index-text-secondary); font-weight: 600; }
                .staff-scope .picker-icon-shell { width: 48px; height: 48px; border-radius: 14px; background: var(--index-accent-soft-bg); color: var(--index-primary-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .staff-scope .empty-state-picker { text-align: center; padding: 5rem 2rem; color: var(--index-text-faint); }
            `}</style>

            <div className="picker-header">
                <h1>Design Certificate Template</h1>
                <p>Choose a cohort to design or edit its certificate template.</p>
            </div>

            <input
                type="text"
                className="picker-search"
                placeholder="Search cohorts or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--index-primary-color)" />
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--lgl-error)' }}>
                    <AlertCircle size={32} style={{ marginBottom: '1rem' }} />
                    <p>{error}</p>
                </div>
            ) : filteredCohorts.length === 0 ? (
                <div className="empty-state-picker">
                    <Layers size={40} style={{ marginBottom: '1rem' }} />
                    <p>No cohorts found.</p>
                </div>
            ) : (
                <div className="picker-list">
                    {filteredCohorts.map((cohort) => (
                        <Link key={cohort.id} to={`/instructor/cohorts/${cohort.id}/certificate-design`} className="picker-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div className="picker-icon-shell">
                                    <Award size={22} />
                                </div>
                                <div>
                                    <div className="picker-row-title">{cohort.name}</div>
                                    <div className="picker-row-sub">{cohort.course?.title || 'No course attached'}</div>
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--index-text-faint)" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
