import { useState } from 'react';
import {
    Plus,
    Video,
    Users,
    FileText,
    GripVertical,
    Edit3,
    Calendar,
    TrendingUp,
    ShieldCheck,
    Settings,
    Activity,
    Layers,
    ChevronDown,
    ChevronRight,
    Search,
    BookOpen
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

interface Session {
    id: string;
    title: string;
    type: 'video' | 'live' | 'material' | 'quiz';
    duration?: string;
    time?: string;
    platform?: string;
    format?: string;
    status: 'completed' | 'ongoing' | 'upcoming';
}

interface Module {
    id: string;
    title: string;
    sessions: Session[];
}

interface CourseBlueprint {
    id: string;
    title: string;
    description: string;
    modules: Module[];
    isExpanded?: boolean;
}

export default function CohortDetails() {
    const { id: cohortCode } = useParams();
    const [activeTab, setActiveTab] = useState('roadmap');
    const [searchQuery, setSearchQuery] = useState('');

    const isCompleted = cohortCode?.includes('2025');

    const [cohort] = useState({
        code: cohortCode || "WL-JAN-2026",
        status: isCompleted ? "Completed" : "Active",
        students: isCompleted ? 210 : 124,
        capacity: isCompleted ? 210 : 150,
        retention: isCompleted ? "88%" : "94%",
        revenue: isCompleted ? "$42,100.00" : "$24,676.00",
        launchDate: isCompleted ? "Oct 01, 2025" : "Jan 15, 2026",
        endDate: isCompleted ? "Dec 15, 2025" : "Mar 20, 2026"
    });

    const [assignedCourses, setAssignedCourses] = useState<CourseBlueprint[]>([
        {
            id: 'cb1',
            title: "Executive Brand Systems",
            description: "Master the logic of premium brand architecture and visual systems.",
            isExpanded: true,
            modules: [
                {
                    id: 'm1',
                    title: 'Phase 1: Foundations of Branding',
                    sessions: [
                        { id: 's1', title: 'Why Brand Identity Matters', type: 'video', duration: '12:45', status: 'completed' },
                        { id: 's2', title: 'Defining Your Brand Voice', type: 'video', duration: '15:20', status: 'completed' },
                    ]
                }
            ]
        },
        {
            id: 'cb2',
            title: "Digital Market Dominance",
            description: "Strategic frameworks for market positioning and high-conversion growth.",
            isExpanded: false,
            modules: [
                {
                    id: 'm2',
                    title: 'Module A: Market Psycho-analysis',
                    sessions: [
                        { id: 's3', title: 'Behavioral Funnels', type: 'material', format: 'Interactive Deck', status: 'upcoming' }
                    ]
                }
            ]
        }
    ]);

    const toggleCourseExpansion = (id: string) => {
        setAssignedCourses(assignedCourses.map(c =>
            c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
        ));
    };

    const handleAddCourse = () => {
        const newCourse: CourseBlueprint = {
            id: `cb_${Date.now()}`,
            title: "New Strategic Blueprint",
            description: "Define the core objectives for this new educational unit.",
            isExpanded: true,
            modules: []
        };
        setAssignedCourses([...assignedCourses, newCourse]);
    };

    return (
        <div className="cohort-management-page">
            <style>{`
                .cohort-header-premium {
                    background: white;
                    border: 1.5px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .badge-premium {
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .badge-active { background: #f0fdf4; color: #1a4d3e; border: 1px solid #1a4d3e20; }
                .badge-completed { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }

                .management-tabs-premium {
                    display: flex;
                    gap: 3rem;
                    border-bottom: 2px solid #f1f5f9;
                    margin-bottom: 3rem;
                }

                .tab-premium {
                    padding: 1.25rem 0;
                    font-weight: 850;
                    color: #94a3b8;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .tab-premium.active { color: #1a4d3e; }
                .tab-premium.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 3.5px;
                    background: #1a4d3e;
                    border-radius: 4px;
                }

                .course-blueprint-card {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 28px;
                    margin-bottom: 2.5rem;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
                }

                .blueprint-header {
                    padding: 2rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    background: #fcfdfe;
                    transition: background 0.2s;
                }

                .blueprint-header:hover { background: #f8fafc; }

                .blueprint-title-zone h3 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .blueprint-title-zone p {
                    margin: 6px 0 0 0;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .blueprint-content {
                    padding: 0 2.5rem 2.5rem 2.5rem;
                    border-top: 1.5px solid #f8fafc;
                }

                .module-card-premium {
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-top: 1.5rem;
                    overflow: hidden;
                }

                .module-header-premium {
                    padding: 1.25rem 2rem;
                    background: white;
                    border-bottom: 1.5px solid rgba(241, 245, 249, 0.6);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .session-row-premium {
                    padding: 1.25rem 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    border-bottom: 1.25px solid rgba(241, 245, 249, 0.4);
                }

                .icon-box-premium {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tp-video { background: #eff6ff; color: #2563eb; }
                .tp-live { background: #fef2f2; color: #dc2626; }
                .tp-material { background: #f0fdf4; color: #10b981; }

                .btn-primary-forest {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    padding: 0.85rem 2.25rem;
                    border-radius: 16px;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                    transition: all 0.3s;
                }

                .action-pill {
                    padding: 0.6rem 1.25rem;
                    border: 2px solid #f1f5f9;
                    background: white;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 850;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: #475569;
                }

                .search-bar-premium {
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 18px;
                    padding: 0 1.5rem;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    max-width: 400px;
                }

                .search-bar-premium input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-weight: 600;
                    color: #0f172a;
                    width: 100%;
                }
            `}</style>

            <div className="cohort-header-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
                            <span className={`badge-premium ${cohort.status === 'Active' ? 'badge-active' : 'badge-completed'}`}>{cohort.status}</span>
                            <span style={{ fontSize: '0.9rem', color: '#1a4d3e', fontWeight: 900, background: '#f0fdf4', padding: '4px 12px', borderRadius: '8px' }}>{cohort.code}</span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Operational Cycle: {cohort.launchDate} — {cohort.endDate}</span>
                        </div>
                        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>Strategic Cohort Console</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '1.15rem', fontWeight: 600 }}>Deploying across {assignedCourses.length} Assigned Course Blueprints</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="action-pill"><Settings size={18} /> Batch Settings</button>
                        <button className="btn-primary-forest" onClick={handleAddCourse}><Plus size={20} /> Assign New Course</button>
                    </div>
                </div>
            </div>

            <div className="management-tabs-premium">
                <div className={`tab-premium ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}><Layers size={18} /> Curriculum Roadmap</div>
                <div className={`tab-premium ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><Users size={18} /> Cohort Directory</div>
                <div className={`tab-premium ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}><TrendingUp size={18} /> Performance Analytics</div>
            </div>

            {activeTab === 'roadmap' && (
                <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div className="search-bar-premium">
                            <Search size={20} color="#94a3b8" />
                            <input
                                placeholder="Search courses in this cohort..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="action-pill"><Calendar size={18} /> Launch Timeline</button>
                            <button className="action-pill"><Activity size={18} /> Drip Logic</button>
                        </div>
                    </div>

                    {assignedCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => (
                        <div key={course.id} className="course-blueprint-card">
                            <div className="blueprint-header" onClick={() => toggleCourseExpansion(course.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '14px', color: '#1a4d3e' }}>
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="blueprint-title-zone">
                                        <h3>{course.title}</h3>
                                        <p>{course.description}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Completion</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>68% Avg.</div>
                                    </div>
                                    <div style={{ color: '#cbd5e1' }}>
                                        {course.isExpanded ? <ChevronDown size={28} /> : <ChevronRight size={28} />}
                                    </div>
                                </div>
                            </div>

                            {course.isExpanded && (
                                <div className="blueprint-content">
                                    {course.modules.length === 0 && (
                                        <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: '24px', margin: '1.5rem 0' }}>
                                            <p style={{ color: '#94a3b8', fontWeight: 600 }}>No curriculum structure defined for this blueprint yet.</p>
                                            <Link to={`/instructor/curriculum/${course.id}`} className="btn-primary-forest" style={{ display: 'inline-flex', marginTop: '1rem' }}>Initiate Builder</Link>
                                        </div>
                                    )}
                                    {course.modules.map(mod => (
                                        <div key={mod.id} className="module-card-premium">
                                            <div className="module-header-premium">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <GripVertical size={20} color="#cbd5e1" />
                                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{mod.title}</h4>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="action-pill" style={{ padding: '6px 10px' }}><Edit3 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="module-body">
                                                {mod.sessions.map(sess => (
                                                    <div key={sess.id} className="session-row-premium">
                                                        <div className={`icon-box-premium tp-${sess.type}`}>
                                                            {sess.type === 'video' && <Video size={18} />}
                                                            {sess.type === 'live' && <Activity size={18} />}
                                                            {sess.type === 'material' && <FileText size={18} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 850, fontSize: '0.95rem', color: '#0f172a' }}>{sess.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                                                {sess.type} • {sess.duration || sess.format || sess.time}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <button className="action-pill" style={{ padding: '8px 12px' }}><Settings size={16} /></button>
                                                            <button className="action-pill" style={{ padding: '8px 12px' }}><ShieldCheck size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={{ padding: '1rem 2rem', background: '#fcfdfe', display: 'flex', gap: '1rem' }}>
                                                    <button style={{ border: 'none', background: 'transparent', color: '#1a4d3e', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Session Component</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                                        <Link to={`/instructor/curriculum/${course.id}`} className="action-pill" style={{ borderStyle: 'dashed', background: 'transparent', padding: '1rem 3rem' }}>
                                            <Edit3 size={18} /> Expand Strategic Blueprint
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

