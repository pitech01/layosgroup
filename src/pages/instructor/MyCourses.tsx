import {
    Plus,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    Users,
    Trash2,
    Edit2,
    Eye,
    Video,
    Globe,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCourses() {
    const stats = [
        { label: 'Total Managed Cohorts', count: 7, trend: '+1', isUp: true, color: '#1a4d3e', icon: CheckCircle2 },
        { label: 'Active & Upcoming', count: 6, trend: '0', isUp: true, color: '#64748b', icon: BookOpen },
    ];

    const cohorts = [
        {
            id: 1,
            batch_code: 'WL-JAN-2026',
            title: 'Work-Life Balance: Achieve',
            category: 'Productivity',
            students: 124,
            status: 'Active',
            delivery_type: 'recorded',
            timeline: 'Jan 15 - Mar 20',
            image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 2,
            batch_code: 'REACT-ARCH-04',
            title: 'Advanced React Architecture',
            category: 'Development',
            students: 856,
            status: 'Active',
            delivery_type: 'hybrid',
            timeline: 'Feb 01 - May 15',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 3,
            batch_code: 'UI-FE-PRIN',
            title: 'UI Design Principles',
            category: 'Design',
            students: 450,
            status: 'Upcoming',
            delivery_type: 'live',
            timeline: 'Apr 10 - Jun 30',
            image: 'https://images.unsplash.com/photo-1541462608141-ad4d14b43c4a?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 4,
            batch_code: 'DS-2025-Q4',
            title: 'Data Science Bootcamp',
            category: 'Analytics',
            students: 210,
            status: 'Completed',
            delivery_type: 'recorded',
            timeline: 'Oct 01 - Dec 15, 2025',
            image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=100&h=100'
        }
    ];

    return (
        <div className="instructor-courses-page">
            <style>{`
                .courses-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }

                .courses-header h2 {
                    font-size: 1.75rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .courses-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3.5rem;
                }

                .stat-card-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 24px;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

                .filter-section {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                    flex-wrap: wrap;
                }

                .search-pill-container {
                    position: relative;
                    flex: 2;
                    min-width: 350px;
                }

                .search-pill-input {
                    height: 56px;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    background: white;
                    color: #1e293b;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 0 1.5rem;
                    width: 100%;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .search-pill-input:focus {
                    border-color: #10b981;
                    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.05);
                }

                .filter-pill-premium {
                    height: 56px;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    background: white;
                    color: #475569;
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

                .filter-pill-premium:hover {
                    border-color: #1a4d3e30;
                    background: #f8fafc;
                }

                .course-table-card-premium {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.02);
                }

                .course-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .course-table th {
                    text-align: left;
                    padding: 1.5rem 2rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #f1f5f9;
                }

                .course-table td {
                    padding: 1.75rem 2rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .course-identity {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .thumb-rounded-premium {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    object-fit: cover;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .status-pill-premium {
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-pill-premium.active { background: #f0fdf4; color: #16a34a; }
                .status-pill-premium.upcoming { background: #eff6ff; color: #2563eb; }
                .status-pill-premium.completed { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

                .action-btn-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn-circle:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                    transform: translateY(-2px);
                }
                
                .btn-standard {
                    height: 52px;
                    padding: 0 2rem;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    border: none;
                    color: white;
                    text-decoration: none;
                }
            `}</style>

            <div className="courses-header">
                <div>
                    <h2>Cohort Inventory</h2>
                    <p style={{ color: '#64748b', margin: '0.4rem 0 0 0', fontWeight: 600 }}>Manage, track, and optimize your global batch deployments.</p>
                </div>
                <Link
                    to="/instructor/courses/create"
                    className="btn-standard"
                    style={{ background: '#1a4d3e', boxShadow: '0 10px 15px -3px rgba(26, 77, 62, 0.2)' }}
                >
                    <Plus size={20} /> Create New Batch
                </Link>
            </div>

            <div className="courses-stats-grid">
                {stats.map((stat, i) => (
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
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.75rem', fontWeight: 950, color: '#0f172a' }}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-section">
                <div className="search-pill-container">
                    <input type="text" placeholder="Search batches, codes, or intellectual blueprints..." className="search-pill-input" />
                </div>
                <div className="filter-pill-premium">
                    <span>Category</span>
                    <ChevronDown size={18} />
                </div>
                <div className="filter-pill-premium">
                    <span>Status</span>
                    <ChevronDown size={18} />
                </div>
            </div>

            <div className="course-table-card-premium">
                <div style={{ overflowX: 'auto' }}>
                    <table className="course-table">
                        <thead>
                            <tr>
                                <th>Batch / Blueprint</th>
                                <th>Operational Data</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cohorts.map(cohort => (
                                <tr key={cohort.id}>
                                    <td>
                                        <div className="course-identity">
                                            <img src={cohort.image} className="thumb-rounded-premium" alt="" />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1a4d3e', background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', letterSpacing: '0.05em' }}>{cohort.batch_code}</span>
                                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{cohort.title}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                                                <Clock size={14} /> {cohort.timeline}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {cohort.delivery_type === 'recorded' && <div style={{ fontSize: '0.7rem', color: '#1a4d3e', fontWeight: 800, textTransform: 'uppercase' }}><Video size={12} /> On-Demand</div>}
                                                {cohort.delivery_type === 'hybrid' && <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase' }}><Globe size={12} /> Hybrid</div>}
                                                {cohort.delivery_type === 'live' && <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}><Users size={12} /> Synchronous</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '100px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(100, (cohort.students / 1000) * 100)}%`, height: '100%', background: '#1a4d3e' }}></div>
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cohort.students}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill-premium ${cohort.status.toLowerCase()}`}>
                                            {cohort.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <Link to={`/instructor/cohort/${cohort.batch_code}`} className="action-btn-circle" title="Manage Batch"><Eye size={20} /></Link>
                                            <Link to={`/instructor/curriculum/${cohort.id}`} className="action-btn-circle" title="Edit Blueprint"><Edit2 size={20} /></Link>
                                            <button className="action-btn-circle" style={{ color: '#ef4444' }} title="Terminate Batch"><Trash2 size={20} /></button>
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
