import { useState, useEffect } from 'react';
import {
    Plus,
    Layers,
    Calendar,
    Users,
    CheckCircle2,
    Eye,
    Trash2,
    Search,
    Filter,
    ShieldAlert,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CohortsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
                // Filter by instructor_id to be extra safe (though backend now handles this)
                const filtered = data.filter((c: any) => String(c.instructor_id) === String(user?.id));
                setCohorts(filtered);
            } else {
                throw new Error(data.message || 'Failed to connect to the course server.');
            }
        } catch (err: any) {
            console.error("Fetch Cohorts Error:", err);
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                toast.error('Connection failed. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/instructor-login');
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, [user?.id]);

    const handleDeleteCohort = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this cohort? All enrollment data will be removed.')) return;

        try {
            const response = await fetch(`${API_URL}/cohorts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setCohorts(cohorts.filter(c => c.id !== id));
            } else {
                alert('Action failed. The cohort might have active enrollments.');
            }
        } catch (err) {
            alert('Connection timeout. Please check your network.');
        }
    };

    const stats = [
        { label: 'Active Cohorts', count: cohorts.length, trend: 'Updated', isUp: true, color: '#1a4d3e', icon: CheckCircle2 },
        { label: 'Total Enrollment', count: cohorts.reduce((acc, c) => acc + (c.students?.length || 0), 0), trend: 'Real-time', isUp: true, color: '#64748b', icon: Users },
    ];

    const filteredCohorts = cohorts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="cohorts-inventory-container">
            <style>{`
                .staff-scope .inventory-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }

                .staff-scope .inventory-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                .staff-scope .inventory-header-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0 0;
                }

                .staff-scope .stats-grid-inventory {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3.5rem;
                }

                .staff-scope .stat-card-premium-inventory {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
                }

                .staff-scope .icon-box-inventory {
                    width: 64px;
                    height: 64px;
                    border-radius: 18px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .staff-scope .search-filter-belt {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .staff-scope .cohort-table-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .cohort-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .staff-scope .cohort-table th {
                    text-align: left;
                    padding: 1.75rem 2rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .staff-scope .cohort-table td {
                    padding: 2rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .staff-scope .status-badge-inventory {
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-block;
                }

                .staff-scope .status-active { background: #f0fdf4; color: #16a34a; }
                .staff-scope .status-upcoming { background: #eff6ff; color: #2563eb; }
                .staff-scope .status-completed { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }

                .staff-scope .blueprint-tag {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 850;
                    color: #0f172a;
                }

                .staff-scope .blueprint-empty {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #ef4444;
                    background: #fef2f2;
                    padding: 4px 12px;
                    border-radius: 8px;
                    width: fit-content;
                }

                .staff-scope .btn-create-shell {
                    height: 60px;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 18px;
                    padding: 0 2.5rem;
                    font-weight: 950;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                    text-decoration: none;
                }

                .staff-scope .action-fab-inventory {
                    width: 44px;
                    height: 44px;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .staff-scope .action-fab-inventory:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .staff-scope .btn-manage-text {
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    color: #1a4d3e;
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .staff-scope .btn-manage-text:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .staff-scope .btn-delete-text {
                    background: #fef2f2;
                    border: 1.5px solid #fee2e2;
                    color: #ef4444;
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .staff-scope .btn-delete-text:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .staff-scope .table-responsive-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                @media (max-width: 1024px) {
                    .staff-scope .inventory-header-premium h1 { font-size: 2rem; }
                    .staff-scope .stats-grid-inventory { grid-template-columns: 1fr 1fr; }
                }

                @media (max-width: 768px) {
                    .staff-scope .inventory-header-premium {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                        margin-bottom: 2.5rem;
                    }

                    .staff-scope .inventory-header-premium h1 {
                        font-size: 1.75rem;
                    }
                    
                    .staff-scope .btn-create-shell {
                        width: 100%;
                        justify-content: center;
                        height: 52px;
                        border-radius: 14px;
                    }

                    .staff-scope .stats-grid-inventory {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .staff-scope .stat-card-premium-inventory {
                        padding: 1.5rem;
                        border-radius: 20px;
                    }

                    .staff-scope .icon-box-inventory {
                        width: 48px;
                        height: 48px;
                    }

                    .staff-scope .search-filter-belt {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .staff-scope .filter-pill-premium {
                        width: 100%;
                    }

                   .staff-scope  .cohort-table th, .cohort-table td {
                        padding: 1.25rem 1rem;
                    }

                   .staff-scope  .cohort-table {
                        min-width: 800px;
                    }

                    .staff-scope .cohort-table-card {
                        border-radius: 24px;
                    }
                }

                @media (max-width: 480px) {
                   .staff-scope  .inventory-header-premium h1 {
                        font-size: 1.5rem;
                    }
                   .staff-scope  .inventory-header-premium p {
                        font-size: 0.95rem;
                    }
                }
            `}</style>

            <div className="inventory-header-premium">
                <div>
                    <h1>Cohort Management</h1>
                    <p>Track and manage your active learning groups and class schedules.</p>
                </div>
                <Link to="/instructor/cohorts/create" className="btn-create-shell">
                    <Plus size={20} /> Create New Cohort
                </Link>
            </div>

            <div className="stats-grid-inventory">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-premium-inventory shadow-premium">
                        <div className="icon-box-inventory">
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>{stat.label}</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: 950, color: '#0f172a' }}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="search-filter-belt">
                <div style={{ flex: 1, height: '56px', background: 'white', border: '2px solid #f1f5f9', borderRadius: '18px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '12px' }}>
                    <Search size={22} color="#94a3b8" />
                    <input
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600 }}
                        placeholder="Search cohorts or batches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ height: '56px', background: 'white', border: '2px solid #f1f5f9', borderRadius: '18px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '12px', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>
                    <span>Live Status</span>
                    <Filter size={18} />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Loading cohort records...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '3rem', background: '#fff1f2', borderRadius: '24px', border: '1.5px solid #ffe4e6', textAlign: 'center', marginBottom: '3rem' }}>
                    <AlertCircle size={40} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 900 }}>Connection Interrupted</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 2rem' }}>{error}</p>
                    <button onClick={fetchCohorts} className="btn-primary-forest" style={{ margin: '0 auto' }}>Try Connecting Again</button>
                </div>
            ) : (
                <div className="cohort-table-card shadow-premium">
                    <div className="table-responsive-wrapper">
                        <table className="cohort-table">
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '250px' }}>Class / Batch</th>
                                    <th style={{ minWidth: '150px' }}>Status</th>
                                    <th style={{ minWidth: '200px' }}>Course Title</th>
                                    <th style={{ minWidth: '250px' }}>Semester Timeline</th>
                                    <th style={{ minWidth: '150px' }}>Enrollment</th>
                                    <th style={{ textAlign: 'right', minWidth: '220px' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCohorts.length > 0 ? filteredCohorts.map(cohort => (
                                    <tr key={cohort.id}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1a4d3e' }}>ID: {cohort.id}</span>
                                                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', marginTop: '4px' }}>{cohort.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`status-badge-inventory status-${(cohort.status || 'Active').toLowerCase()}`}>{cohort.status || 'Active'}</div>
                                        </td>
                                        <td>
                                            {cohort.course ? (
                                                <div className="blueprint-tag">
                                                    <Layers size={18} color="#1a4d3e" />
                                                    {cohort.course.title}
                                                </div>
                                            ) : (
                                                <div className="blueprint-empty">
                                                    <ShieldAlert size={16} />
                                                    Course Not Assigned
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                                                <Calendar size={16} /> {new Date(cohort.start_date).toLocaleDateString()} — {new Date(cohort.end_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Users size={18} color="#94a3b8" />
                                                <span style={{ fontWeight: 950, color: '#0f172a' }}>{cohort.students?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                <Link to={`/instructor/cohorts/${cohort.id}`} className="btn-manage-text">
                                                    <Eye size={16} /> Dashboard
                                                </Link>
                                                <button className="btn-delete-text" onClick={() => handleDeleteCohort(cohort.id)}>
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: '#64748b', fontWeight: 800 }}>
                                            No cohorts found matching your current search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
