import { useState, useEffect } from 'react';
import {
    Plus,
    Layers,
    Search,
    Filter,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    Video,
    Users,
    FileText,
    HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CourseLibrary() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/courses`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter by instructor
                const filtered = data.filter((c: any) => String(c.instructor_id) === String(user?.id));
                setCourses(filtered);
            } else {
                throw new Error(data.message || 'Failed to retrieve course list.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user?.id]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
            try {
                const response = await fetch(`${API_URL}/courses/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    setCourses(courses.filter(c => c.id !== id));
                } else {
                    alert('Action failed. The course might be in use and cannot be removed.');
                }
            } catch (err) {
                alert('Connection error. Please check your network.');
            }
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="course-library-container">
            <style>{`
                .library-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3.5rem;
                    gap: 1.5rem;
                }

                @media (max-width: 768px) {
                    .library-header-premium {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                        margin-bottom: 2.5rem;
                    }
                }

                .library-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                @media (max-width: 640px) {
                    .library-header-premium h1 {
                        font-size: 2rem;
                    }
                }

                .library-header-premium p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0 0;
                }

                .search-filter-belt {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                @media (max-width: 1024px) {
                    .search-filter-belt {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }

                .search-pill-premium {
                    flex: 1;
                    height: 56px;
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

                .search-pill-premium input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                }

                .filter-group {
                    display: flex;
                    gap: 1rem;
                }

                @media (max-width: 640px) {
                    .filter-group {
                        flex-direction: column;
                    }
                    .filter-pill-premium {
                        width: 100% !important;
                    }
                }

                .filter-pill-premium {
                    width: 180px;
                    height: 56px;
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                    font-weight: 800;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .filter-pill-premium:hover { border-color: #1a4d3e30; color: #1a4d3e; }

                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
                    gap: 2rem;
                }

                @media (max-width: 640px) {
                    .template-grid {
                        gap: 1.25rem;
                    }
                    .template-card-premium {
                        padding: 1.5rem !important;
                    }
                }

                .template-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    padding: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .template-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 30px -10px rgba(0,0,0,0.05);
                    border-color: #1a4d3e40;
                }

                .category-badge-library {
                    padding: 4px 10px;
                    background: #f0fdf4;
                    color: #1a4d3e;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.25rem;
                    display: inline-block;
                }

                .template-title-premium {
                    font-size: 1.4rem;
                    font-weight: 950;
                    margin: 0 0 0.75rem 0;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .template-description-premium {
                    font-size: 0.95rem;
                    color: #64748b;
                    font-weight: 500;
                    line-height: 1.5;
                    margin-bottom: 2rem;
                    height: 48px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .template-meta-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1.5px solid #f1f5f9;
                }

                .meta-item-library {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .action-fab-library {
                    padding: 0 1rem;
                    height: 44px;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-fab-library:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .action-fab-library.delete-btn {
                    color: #ef4444; 
                    background: #fff1f2;
                    border-color: #fee2e2;
                }

                .action-fab-library.delete-btn:hover {
                    background: #ef4444;
                    color: white;
                    border-color: #ef4444;
                }

                .action-fab-library.edit-btn {
                    color: #1a4d3e;
                    background: #f0fdf4;
                    border-color: #dcfce7;
                }

                .action-fab-library.edit-btn:hover {
                    background: #1a4d3e;
                    color: white;
                    border-color: #1a4d3e;
                }

                .btn-create-master {
                    height: 60px;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 18px;
                    padding: 0 2rem;
                    font-weight: 950;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                @media (max-width: 640px) {
                    .btn-create-master {
                        height: 52px;
                        border-radius: 14px;
                        font-size: 0.9rem;
                    }
                }

                .btn-create-master:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.25);
                }

                @media (max-width: 480px) {
                    .template-meta-strip {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .template-meta-strip div {
                        flex-direction: column;
                        width: 100%;
                    }
                    .action-fab-library {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="library-header-premium">
                <div>
                    <h1>Course Library</h1>
                    <p>Manage and organize your learning materials and curriculums.</p>
                </div>
                <Link to="/instructor/course-library/create" className="btn-create-master" style={{ textDecoration: 'none' }}>
                    <Plus size={20} /> Create New Course
                </Link>
            </div>

            <div className="search-filter-belt">
                <div className="search-pill-premium shadow-premium">
                    <Search size={22} color="#94a3b8" />
                    <input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <div className="filter-pill-premium shadow-premium">
                        <span>Level</span>
                        <Filter size={18} />
                    </div>
                    <div className="filter-pill-premium shadow-premium">
                        <span>Category</span>
                        <Filter size={18} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1a4d3e" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#64748b' }}>Opening Course Catalog...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '3rem', background: '#fff1f2', borderRadius: '24px', border: '1.5px solid #ffe4e6', textAlign: 'center' }}>
                    <AlertCircle size={40} color="#e11d48" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 900 }}>Database Connection Failed</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 2rem' }}>{error}</p>
                    <button onClick={fetchCourses} className="btn-primary-forest" style={{ margin: '0 auto' }}>Try Connecting Again</button>
                </div>
            ) : (
                <div className="template-grid">
                    {filteredCourses.length > 0 ? filteredCourses.map(course => (
                        <div key={course.id} className="template-card-premium shadow-premium">

                            <h3 className="template-title-premium">{course.title}</h3>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: course.category === 'live' ? '#fee2e2' :
                                        course.category === 'material' ? '#ecfdf5' :
                                            course.category === 'quiz' ? '#fff7ed' : '#eff6ff',
                                    color: course.category === 'live' ? '#b91c1c' :
                                        course.category === 'material' ? '#065f46' :
                                            course.category === 'quiz' ? '#9a3412' : '#1d4ed8'
                                }}>
                                    {course.category === 'live' ? <Users size={12} /> :
                                        course.category === 'material' ? <FileText size={12} /> :
                                            course.category === 'quiz' ? <HelpCircle size={12} /> : <Video size={12} />}
                                    {course.category || 'Video Course'}
                                </span>
                            </div>
                            <p className="template-description-premium">{course.description}</p>

                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="meta-item-library">
                                    <Layers size={16} /> {course.modules?.length || 0} Modules
                                </div>
                            </div>

                            <div className="template-meta-strip">

                                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
                                    <Link to={`/instructor/courses/${course.id}/edit`} className="action-fab-library edit-btn shadow-sm" title="Edit Course" style={{ textDecoration: 'none', flex: 1, gap: '8px', minWidth: '100px' }}>
                                        <Edit2 size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Edit Course</span>
                                    </Link>
                                    <button
                                        className="action-fab-library delete-btn shadow-sm"
                                        style={{ flex: 1, gap: '8px', minWidth: '100px' }}
                                        title="Delete Course"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        <Trash2 size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '5rem', background: '#f8fafc', borderRadius: '32px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                            <Layers size={48} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 900 }}>No Courses Found</h3>
                            <p style={{ color: '#64748b', fontWeight: 600, marginTop: '8px' }}>Your course library is currently empty. Create your first course syllabus to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
