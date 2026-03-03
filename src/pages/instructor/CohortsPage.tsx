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
    ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CohortsPage() {
    const stats = [
        { label: 'Total Cohorts', count: 7, trend: '+1', isUp: true, color: '#1a4d3e', icon: CheckCircle2 },
        { label: 'Average Enrollment', count: '142', trend: '+12%', isUp: true, color: '#64748b', icon: Users },
    ];

    const cohorts = [
        {
            id: 'CH-WLB-JAN',
            name: 'Masterclass Batch Jan 2026',
            blueprint: 'Work-Life Balance: Achieve',
            startDate: 'Jan 15, 2026',
            endDate: 'Mar 20, 2026',
            status: 'Active',
            studentsCount: 124,
            capacity: 150,
            hasCourse: true,
            deliveryMode: 'recorded'
        },
        {
            id: 'CH-REACT-ARCH',
            name: 'Senior React Cohort 04',
            blueprint: null,
            startDate: 'Feb 10, 2026',
            endDate: 'May 15, 2026',
            status: 'Upcoming',
            studentsCount: 0,
            capacity: 200,
            hasCourse: false,
            deliveryMode: 'hybrid'
        },
        {
            id: 'CH-FE-PRIN',
            name: 'UI Design Principles — Global',
            blueprint: 'Executive Brand Systems',
            startDate: 'Apr 01, 2026',
            endDate: 'Jun 30, 2026',
            status: 'Upcoming',
            studentsCount: 450,
            capacity: 500,
            hasCourse: true,
            deliveryMode: 'live'
        },
        {
            id: 'CH-DS-2025',
            name: 'Data Science Alumni Batch',
            blueprint: 'Digital Market Psychology',
            startDate: 'Oct 01, 2025',
            endDate: 'Dec 15, 2025',
            status: 'Completed',
            studentsCount: 210,
            capacity: 210,
            hasCourse: true,
            deliveryMode: 'recorded'
        }
    ];

    return (
        <div className="cohorts-inventory-container">
            <style>{`
                .inventory-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }

                .inventory-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                .inventory-header-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0 0;
                }

                .stats-grid-inventory {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3.5rem;
                }

                .stat-card-premium-inventory {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
                }

                .icon-box-inventory {
                    width: 64px;
                    height: 64px;
                    border-radius: 18px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .search-filter-belt {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .cohort-table-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                .cohort-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .cohort-table th {
                    text-align: left;
                    padding: 1.75rem 2rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .cohort-table td {
                    padding: 2rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .status-badge-inventory {
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-block;
                }

                .status-active { background: #f0fdf4; color: #16a34a; }
                .status-upcoming { background: #eff6ff; color: #2563eb; }
                .status-completed { background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; }

                .blueprint-tag {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 850;
                    color: #0f172a;
                }

                .blueprint-empty {
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

                .btn-create-shell {
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

                .action-fab-inventory {
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

                .action-fab-inventory:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .btn-manage-text {
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

                .btn-manage-text:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .btn-delete-text {
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

                .btn-delete-text:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .table-responsive-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                @media (max-width: 1024px) {
                    .inventory-header-premium h1 { font-size: 2rem; }
                    .stats-grid-inventory { grid-template-columns: 1fr 1fr; }
                }

                @media (max-width: 768px) {
                    .inventory-header-premium {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                        margin-bottom: 2.5rem;
                    }
                    
                    .btn-create-shell {
                        width: 100%;
                        justify-content: center;
                    }

                    .stats-grid-inventory {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .search-filter-belt {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .filter-pill-premium {
                        width: 100%;
                    }

                    .cohort-table th, .cohort-table td {
                        padding: 1.25rem 1rem;
                    }

                    .cohort-table {
                        min-width: 800px;
                    }
                }
            `}</style>

            <div className="inventory-header-premium">
                <div>
                    <h1>Cohort</h1>
                    <p>Manage and track your active cohorts.</p>
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
                    <input style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600 }} placeholder="Search cohorts..." />
                </div>
                <div style={{ height: '56px', background: 'white', border: '2px solid #f1f5f9', borderRadius: '18px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '12px', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>
                    <span>Status</span>
                    <Filter size={18} />
                </div>
            </div>

            <div className="cohort-table-card shadow-premium">
                <div className="table-responsive-wrapper">
                    <table className="cohort-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth: '250px' }}>Batch</th>
                                <th style={{ minWidth: '150px' }}>Status</th>
                                <th style={{ minWidth: '200px' }}>Course</th>
                                <th style={{ minWidth: '250px' }}>Timeline</th>
                                <th style={{ minWidth: '150px' }}>Enrolled</th>
                                <th style={{ textAlign: 'right', minWidth: '220px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cohorts.map(cohort => (
                                <tr key={cohort.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1a4d3e' }}>{cohort.id}</span>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', marginTop: '4px' }}>{cohort.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge-inventory status-${cohort.status.toLowerCase()}`}>{cohort.status}</div>
                                    </td>
                                    <td>
                                        {cohort.blueprint ? (
                                            <div className="blueprint-tag">
                                                <Layers size={18} color="#1a4d3e" />
                                                {cohort.blueprint}
                                            </div>
                                        ) : (
                                            <div className="blueprint-empty">
                                                <ShieldAlert size={16} />
                                                No Course Attached
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                                            <Calendar size={16} /> {cohort.startDate} — {cohort.endDate}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Users size={18} color="#94a3b8" />
                                            <span style={{ fontWeight: 950, color: '#0f172a' }}>{cohort.studentsCount}</span>
                                            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/ {cohort.capacity}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <Link to={`/instructor/cohorts/${cohort.id}`} className="btn-manage-text">
                                                <Eye size={16} /> Manage
                                            </Link>
                                            <button className="btn-delete-text">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
