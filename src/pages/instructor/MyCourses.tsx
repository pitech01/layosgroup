import {
    Plus,
    CheckCircle2,
    Users,
    Trash2,
    Eye,
    Clock,
    Loader2,
    Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Cohort {
    id: string | number;
    name: string;
    start_date: string;
    course?: {
        id: string;
        title: string;
    };
    students: Array<{ id: string | number; name: string }>;
}

export default function MyCourses() {
    const [cohortsList, setCohortsList] = useState<Cohort[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCohorts = async () => {
        try {
            const response = await fetch(`${API_URL}/cohorts`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCohortsList(data);
            }
        } catch (err) {
            console.error("Fetch Cohorts Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohorts();
    }, []);

    const handleDeleteCohort = async (id: string | number) => {
        if (window.confirm('Are you sure you want to delete this cohort? All student progress data for this group will be lost.')) {
            try {
                const response = await fetch(`${API_URL}/cohorts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setCohortsList(cohortsList.filter(c => c.id !== id));
                } else {
                    alert('Failed to delete cohort.');
                }
            } catch (err) {
                console.error("Delete Cohort Error:", err);
                alert('An error occurred.');
            }
        }
    };

    const filteredCohorts = cohortsList.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Active Cohorts', count: cohortsList.length, trend: 'Managed', color: 'var(--index-primary-color)', icon: CheckCircle2 },
        { label: 'Student Body', count: cohortsList.reduce((acc, c) => acc + (c.students?.length || 0), 0), trend: 'Enrolled', color: 'var(--index-text-secondary)', icon: Users },
    ];

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--index-primary-color)" />
                <p style={{ fontWeight: 800, color: 'var(--index-text-secondary)' }}>Loading Records...</p>
            </div>
        );
    }

    return (
        <div className="instructor-courses-page animate-fade-in-up">
            <style>{`
                .staff-scope .courses-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }

                .courses-header h2 {
                    font-size: 1.75rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .staff-scope .courses-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3.5rem;
                }

                .staff-scope .stat-card-premium {
                    background: white;
                    border: 1px solid color-mix(in srgb, var(--index-border-color) 80%, transparent);
                    border-radius: 24px;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

                .staff-scope .filter-section {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                    flex-wrap: wrap;
                }

                .staff-scope .search-pill-container {
                    position: relative;
                    flex: 2;
                    min-width: 350px;
                }

                .staff-scope .search-pill-input {
                    height: 56px;
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 18px;
                    background: white;
                    color: var(--index-text-heading);
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 0 1.5rem 0 3.5rem;
                    width: 100%;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .search-pill-input:focus {
                    border-color: var(--index-primary-color);
                    box-shadow: 0 0 0 5px color-mix(in srgb, var(--index-primary-color) calc(0.05 * 100%), transparent);
                }

                .staff-scope .filter-pill-premium {
                    height: 56px;
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 18px;
                    background: white;
                    color: var(--index-text-secondary);
                    font-size: 0.95rem;
                    font-weight: 700;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 200px;
                }

                .staff-scope .course-table-card-premium {
                    background: white;
                    border: 1px solid color-mix(in srgb, var(--index-border-color) 80%, transparent);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                .staff-scope .course-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .course-table th {
                    text-align: left;
                    padding: 1.5rem 2rem;
                    background: var(--index-hover-bg);
                    color: var(--index-text-secondary);
                    font-size: 0.85rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid var(--index-hover-bg);
                }

                .course-table td {
                    padding: 1.75rem 2rem;
                    border-bottom: 1px solid var(--index-hover-bg);
                    vertical-align: middle;
                }

                .staff-scope .action-btn-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: var(--index-hover-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--index-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .action-btn-circle:hover {
                    background: var(--index-primary-color);
                    color: white;
                    border-color: var(--index-primary-color);
                    transform: translateY(-2px);
                }

                .staff-scope .btn-standard {
                    height: 52px;
                    padding: 0 2rem;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    cursor: pointer;
                    border: none;
                    color: white;
                    text-decoration: none;
                }
            `}</style>

            <div className="courses-header">
                <div>
                    <h2>Cohort Roster</h2>
                    <p style={{ color: 'var(--index-text-secondary)', margin: '0.5rem 0 0 0', fontWeight: 600 }}>Overview of active learning sessions and cohort registrations.</p>
                </div>
                <Link
                    to="/instructor/cohorts/create"
                    className="btn-standard"
                    style={{ background: 'var(--index-primary-color)', boxShadow: '0 10px 15px color-mix(in srgb, var(--index-primary-color) calc(0.15 * 100%), transparent)' }}
                >
                    <Plus size={20} /> New Cohort
                </Link>
            </div>

            <div className="courses-stats-grid">
                {stats.map((stat: any, i: number) => (
                    <div key={i} className="stat-card-premium">
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: `${stat.color}10`,
                            color: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p style={{ margin: 0, color: 'var(--index-text-secondary)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: 950, color: 'var(--index-text-heading)' }}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-section" style={{ marginBottom: '2rem' }}>
                <div className="search-pill-container" style={{ flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--index-text-faint)' }} />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="search-pill-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="course-table-card-premium">
                <div style={{ overflowX: 'auto' }}>
                    <table className="course-table">
                        <thead>
                            <tr>
                                <th>Session Identity</th>
                                <th>Operational Data</th>
                                <th>Population</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCohorts.map(cohort => (
                                <tr key={cohort.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--index-hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--index-primary-color)', fontWeight: 950 }}>
                                                {cohort.name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--index-primary-color)', background: 'color-mix(in srgb, var(--lgl-success) 12%, transparent)', padding: '2px 8px', borderRadius: '6px', width: 'fit-content' }}>{cohort.id}</span>
                                                <span style={{ fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1rem' }}>{cohort.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--index-text-secondary)', fontWeight: 600 }}>{cohort.course?.title || 'No Curriculum Linked'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>
                                                <Clock size={14} /> {new Date(cohort.start_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--index-text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Session Active</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Users size={18} color="var(--index-text-faint)" />
                                            <span style={{ fontWeight: 950, fontSize: '1rem', color: 'var(--index-text-heading)' }}>{cohort.students?.length || 0}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <Link to={`/instructor/cohorts/${cohort.id}`} className="action-btn-circle" style={{ width: 'auto', padding: '0 1.25rem', gap: '8px' }}>
                                                <Eye size={18} /> <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>Manage</span>
                                            </Link>
                                            <button
                                                className="action-btn-circle"
                                                title="Delete"
                                                onClick={() => handleDeleteCohort(cohort.id)}
                                                style={{ color: 'var(--lgl-error)' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
