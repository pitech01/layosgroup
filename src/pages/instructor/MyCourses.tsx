import {
    Plus,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    MoreVertical,
    Users,
    Trash2,
    Edit2,
    Eye,
    Video,
    Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCourses() {
    const stats = [
        { label: 'Active Courses', count: 4, trend: '+1', isUp: true, color: '#10b981', icon: CheckCircle2 },
        { label: 'In-Active Courses', count: 2, trend: '0', isUp: true, color: '#64748b', icon: BookOpen },
    ];

    const courses = [
        {
            id: 1,
            title: 'Work-Life Balance: Achieve',
            category: 'Productivity',
            price: '$200.00',
            students: 124,
            status: 'Active',
            delivery_type: 'recorded',
            image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 2,
            title: 'Advanced React Architecture',
            category: 'Development',
            price: '$150.00',
            students: 856,
            status: 'Active',
            delivery_type: 'hybrid',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 3,
            title: 'UI Design Principles',
            category: 'Design',
            price: '$99.00',
            students: 450,
            status: 'In-Active',
            delivery_type: 'live',
            image: 'https://images.unsplash.com/photo-1541462608141-ad4d14b43c4a?auto=format&fit=crop&q=80&w=100&h=100'
        }
    ];

    return (
        <div className="instructor-courses-page">
            <style>{`
                .courses-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .courses-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .courses-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .stat-card-clean {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .filter-section {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .search-pill-container {
                    position: relative;
                    flex: 2;
                    min-width: 300px;
                }

                /* Standardized input/select base */
                .control-base-standard {
                    height: 48px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    color: #1e293b;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 0 1.25rem;
                }

                .search-pill-input {
                    composes: control-base-standard; /* Conceptually, applying same properties */
                    height: 48px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    color: #1e293b;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    padding: 0 1.25rem;
                    width: 100%;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .search-pill-input:focus {
                    border-color: #020617;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.1);
                }

                .filter-pill {
                    height: 48px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    color: #475569;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    padding: 0 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 180px;
                    flex: 1;
                    justify-content: space-between;
                }

                .filter-pill:hover {
                    border-color: #cbd5e1;
                    background-color: #f8fafc;
                }

                .course-table-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .course-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .course-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    border-bottom: 1px solid #f1f5f9;
                }

                .course-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f8fafc;
                    vertical-align: middle;
                }

                .course-identity {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .thumb-rounded {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    object-fit: cover;
                }

                .course-name-text {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.925rem;
                }

                .status-pill {
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .status-pill.active { background: #f0fdf4; color: #16a34a; }
                .status-pill.in-active { background: #f1f5f9; color: #64748b; }

                .action-icon-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .action-icon-btn:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }

                @media (max-width: 768px) {
                    .courses-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .btn-standard { width: 100%; justify-content: center; }
                }
            `}</style>

            <div className="courses-header">
                <div>
                    <h2>Course Management</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Create, edit, and track the performance of your curriculum.</p>
                </div>
                <Link
                    to="/instructor/courses/create"
                    className="btn-standard"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: '#020617' }}
                >
                    <Plus size={18} /> Create Course
                </Link>
            </div>

            <div className="courses-stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-clean">
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `${stat.color}10`,
                            color: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-section">
                <div className="search-pill-container">
                    <input type="text" placeholder="Search by course title or ID..." className="search-pill-input" />
                </div>
                <div className="filter-pill">
                    <span>Select Category</span>
                    <ChevronDown size={16} style={{ color: '#94a3b8' }} />
                </div>
                <div className="filter-pill">
                    <span>All Status</span>
                    <ChevronDown size={16} style={{ color: '#94a3b8' }} />
                </div>
            </div>

            <div className="course-table-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="course-table">
                        <thead>
                            <tr>
                                <th>Course Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Students</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td>
                                        <div className="course-identity">
                                            <img src={course.image} className="thumb-rounded" alt="" />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span className="course-name-text">{course.title}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {course.delivery_type === 'recorded' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#020617', background: 'rgba(2, 6, 23, 0.08)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}><Video size={10} /> Self-Paced</div>}
                                                    {course.delivery_type === 'hybrid' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#b45309', background: '#fff7ed', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}><Globe size={10} /> Hybrid</div>}
                                                    {course.delivery_type === 'live' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#b91c1c', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}><Users size={10} /> Live</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: '#64748b', fontWeight: 500 }}>{course.category}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{course.price}</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                                            <Users size={14} />
                                            <span style={{ fontWeight: 500 }}>{course.students}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${course.status.toLowerCase()}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end gap-1">
                                            <Link to={`/instructor/courses/${course.id}`} className="action-icon-btn" title="Manage"><Eye size={18} /></Link>
                                            <button className="action-icon-btn" title="Edit"><Edit2 size={18} /></button>
                                            <button className="action-icon-btn" title="Delete" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                            <button className="action-icon-btn"><MoreVertical size={18} /></button>
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
