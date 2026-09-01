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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CourseLibrary() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

            if (response.status === 401) {
                logout();
                navigate('/instructor-login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                // Filter by instructor
                const filtered = data.filter((c: any) => String(c.instructor_id) === String(user?.id));
                setCourses(filtered);
            } else {
                throw new Error(data.message || 'Failed to retrieve course list.');
            }
        } catch (err: any) {
            console.error("Fetch Courses Error:", err);
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
                .staff-scope-2 .library-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3.5rem;
                    gap: 1.5rem;
                }

                @media (max-width: 768px) {
                    .staff-scope-2 .library-header-premium {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                        margin-bottom: 2.5rem;
                    }
                }

                .staff-scope-2 .library-header-premium h1 {
                    font-size: 2.5rem;
                    font-weight: 950;
                    color: var(--index-text-heading);
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                @media (max-width: 640px) {
                    .staff-scope-2 .library-header-premium h1 {
                        font-size: 2rem;
                    }
                }

                .staff-scope-2 .library-header-premium p {
                    color: var(--index-text-secondary);
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0 0;
                }

                .staff-scope-2 .search-filter-belt {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                @media (max-width: 1024px) {
                    .staff-scope-2 .search-filter-belt {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }

                .staff-scope-2 .search-pill-premium {
                    flex: 1;
                    height: 56px;
                    background: white;
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 18px;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

               .staff-scope-2  .search-pill-premium input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--index-text-heading);
                }

                .staff-scope-2 .filter-group {
                    display: flex;
                    gap: 1rem;
                }

                @media (max-width: 640px) {
                    .staff-scope-2 .filter-group {
                        flex-direction: column;
                    }
                    .staff-scope-2 .filter-pill-premium {
                        width: 100% !important;
                    }
                }

                .staff-scope-2 .filter-pill-premium {
                    width: 180px;
                    height: 56px;
                    background: white;
                    border: 2px solid var(--index-hover-bg);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                    font-weight: 800;
                    color: var(--index-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .staff-scope-2 .filter-pill-premium:hover { border-color: var(--index-primary-color)30; color: var(--index-primary-color); }

                .staff-scope-2 .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
                    gap: 2rem;
                }


                @media (max-width: 640px) {
                    .staff-scope-2 .template-grid {
                        gap: 1.25rem;
                    }
                    .staff-scope-2 .template-card-premium {
                        padding: 1.5rem !important;
                    }
                }

                .staff-scope-2 .template-card-premium {
                    background: white;
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 28px;
                    padding: 2rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .staff-scope-2 .template-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 30px -10px rgba(0,0,0,0.05);
                    border-color: var(--index-primary-color)40;
                }

                .staff-scope-2 .category-badge-library {
                    padding: 4px 10px;
                    background: var(--index-accent-soft-bg);
                    color: var(--index-primary-color);
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.25rem;
                    display: inline-block;
                }

                .staff-scope-2 .template-title-premium {
                    font-size: 1.4rem;
                    font-weight: 950;
                    margin: 0 0 0.75rem 0;
                    color: var(--index-text-heading);
                    letter-spacing: -0.02em;
                }

                .staff-scope-2 .template-description-premium {
                    font-size: 0.95rem;
                    color: var(--index-text-secondary);
                    font-weight: 500;
                    line-height: 1.5;
                    margin-bottom: 2rem;
                    height: 48px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .staff-scope-2 .template-meta-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1.5px solid var(--index-hover-bg);
                }

                .staff-scope-2 .meta-item-library {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--index-text-faint);
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .staff-scope-2 .action-fab-library {
                    padding: 0 1rem;
                    height: 44px;
                    background: var(--index-hover-bg);
                    border: 1.5px solid var(--index-hover-bg);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--index-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .staff-scope-2 .action-fab-library:hover {
                    background: var(--index-primary-color);
                    color: white;
                    border-color: var(--index-primary-color);
                }

                .action-fab-library.delete-btn {
                    color: var(--lgl-error); 
                    background: var(--index-danger-bg-soft);
                    border-color: var(--index-danger-bg-soft);
                }

               .staff-scope-2  .action-fab-library.delete-btn:hover {
                    background: var(--lgl-error);
                    color: white;
                    border-color: var(--lgl-error);
                }

               .staff-scope-2  .action-fab-library.edit-btn {
                    color: var(--index-primary-color);
                    background: var(--index-accent-soft-bg);
                    border-color: color-mix(in srgb, var(--lgl-success) 15%, transparent);
                }

               .staff-scope-2 .action-fab-library.edit-btn:hover {
                    background: var(--index-primary-color);
                    color: white;
                    border-color: var(--index-primary-color);
                }

                .staff-scope-2 .btn-create-master {
                    height: 60px;
                    background: var(--index-primary-color);
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
                    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--index-primary-color) 20%, transparent);
                    transition: all 0.3s;
                }

                @media (max-width: 640px) {
                    .staff-scope-2 .btn-create-master {
                        height: 52px;
                        border-radius: 14px;
                        font-size: 0.9rem;
                    }
                }

               .staff-scope-2  .btn-create-master:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px color-mix(in srgb, var(--index-primary-color) 25%, transparent);
                }

                @media (max-width: 480px) {
                    .staff-scope-2 .template-meta-strip {
                        flex-direction: column;
                        gap: 1.25rem;
                    }
                    .staff-scope-2 .action-buttons-group {
                        flex-direction: column;
                        width: 100%;
                    }
                    .staff-scope-2 .action-fab-library {
                        width: 100% !important;
                        justify-content: center;
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
                    <Search size={22} color="var(--index-text-faint)" />
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
                    <Loader2 className="animate-spin" size={48} color="var(--index-primary-color)" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--index-text-secondary)' }}>Opening Course Catalog...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '3rem', background: 'var(--index-danger-bg-soft)', borderRadius: '24px', border: '1.5px solid var(--index-danger-bg-soft)', textAlign: 'center' }}>
                    <AlertCircle size={40} color="var(--lgl-error)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: 0, color: 'var(--index-text-heading)', fontWeight: 900 }}>Database Connection Failed</h3>
                    <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, margin: '8px 0 2rem' }}>{error}</p>
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
                                    background: course.category === 'live' ? 'var(--index-danger-bg-soft)' :
                                        course.category === 'material' ? 'color-mix(in srgb, var(--lgl-success) 15%, transparent)' :
                                            course.category === 'quiz' ? 'color-mix(in srgb, var(--lgl-warning) 15%, transparent)' : 'var(--index-accent-soft-bg)',
                                    color: course.category === 'live' ? 'var(--lgl-error)' :
                                        course.category === 'material' ? 'var(--lgl-success)' :
                                            course.category === 'quiz' ? 'var(--lgl-warning)' : 'var(--index-primary-color)'
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
                                <div className="action-buttons-group" style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <Link to={`/instructor/courses/${course.id}/edit`} className="action-fab-library edit-btn shadow-sm" title="Edit Course" style={{ textDecoration: 'none', flex: '1 1 auto', gap: '8px', minWidth: '100px' }}>
                                        <Edit2 size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Edit</span>
                                    </Link>
                                    <button
                                        className="action-fab-library delete-btn shadow-sm"
                                        style={{ flex: '1 1 auto', gap: '8px', minWidth: '100px' }}
                                        title="Delete Course"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        <Trash2 size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Remove</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '5rem', background: 'var(--index-hover-bg)', borderRadius: '32px', textAlign: 'center', border: '2px dashed var(--index-border-color)' }}>
                            <Layers size={48} color="var(--index-border-subtle)" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ margin: 0, color: 'var(--index-text-heading)', fontWeight: 900 }}>No Courses Found</h3>
                            <p style={{ color: 'var(--index-text-secondary)', fontWeight: 600, marginTop: '8px' }}>Your course library is currently empty. Create your first course syllabus to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
