import { useState } from 'react';
import {
    Plus,
    Video,
    Users,
    FileText,
    MoreVertical,
    GripVertical,
    Edit3,
    Trash2,
    Calendar,
    Globe
} from 'lucide-react';
import { useParams } from 'react-router-dom';

interface Session {
    id: string;
    title: string;
    type: 'video' | 'live' | 'material' | 'quiz';
    duration?: string;
    time?: string;
    platform?: string;
    format?: string;
}

interface Module {
    id: string;
    title: string;
    sessions: Session[];
}

export default function InstructorCourseDetails() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('curriculum');

    const course = {
        title: "Mastering Digital Branding",
        subtitle: "Build a premium brand from scratch in 2024",
        status: "Published",
        enrollments: 124,
        rating: 4.8,
        price: "$199.00",
        lastUpdated: "Oct 24, 2023"
    };

    const modules: Module[] = [
        {
            id: 'm1',
            title: 'Foundations of Branding',
            sessions: [
                { id: 's1', title: 'Why Brand Identity Matters', type: 'video', duration: '12:45' },
                { id: 's2', title: 'Defining Your Brand Voice', type: 'video', duration: '15:20' },
                { id: 's3', title: 'Live Q&A: Brand Strategy', type: 'live', time: 'Tomorrow, 2:00 PM', platform: 'Zoom' }
            ]
        },
        {
            id: 'm2',
            title: 'Visual Design Systems',
            sessions: [
                { id: 's4', title: 'Typography & Color Theory', type: 'material', format: 'PDF Guide' },
                { id: 's5', title: 'Logo Design Workshop', type: 'video', duration: '45:00' }
            ]
        }
    ];

    console.log("Managing course ID:", id);

    return (
        <div style={{ padding: '0.5rem' }}>
            <style>{`
                .course-hero-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: #1a4d3e10;
                    color: #1a4d3e;
                }

                .management-tabs {
                    display: flex;
                    gap: 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 2rem;
                }

                .tab-item {
                    padding: 1rem 0;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }

                .tab-item.active {
                    color: #1a4d3e;
                }

                .tab-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #1a4d3e;
                }

                .module-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }

                .module-header {
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .session-row {
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.2s;
                }

                .session-row:hover {
                    background: #f8fafc;
                }

                .session-row:last-child {
                    border-bottom: none;
                }

                .icon-box {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .type-video { background: #eff6ff; color: #3b82f6; }
                .type-live { background: #fee2e2; color: #ef4444; }
                .type-material { background: #f0fdf4; color: #22c55e; }

                .action-btn-outline {
                    padding: 0.5rem 1rem;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn-outline:hover {
                    border-color: #1a4d3e;
                    color: #1a4d3e;
                }

                .action-icon-btn {
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .action-icon-btn:hover {
                    color: #1a4d3e;
                }
            `}</style>

            <div className="course-hero-card">
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <span className="status-badge">{course.status}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Last updated {course.lastUpdated}</span>
                    </div>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 800 }}>{course.title}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>{course.subtitle}</p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>ENROLLMENTS</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{course.enrollments}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>RATING</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>★ {course.rating}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>REVENUE</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>$24,676.00</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="action-btn-outline"><Edit3 size={18} /> Edit Course</button>
                    <button className="btn-standard" style={{ background: '#1a4d3e', display: 'flex', gap: '8px' }}><Globe size={18} /> View Live</button>
                </div>
            </div>

            <div className="management-tabs">
                <div className={`tab-item ${activeTab === 'curriculum' ? 'active' : ''}`} onClick={() => setActiveTab('curriculum')}>Curriculum</div>
                <div className={`tab-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</div>
                <div className={`tab-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
                <div className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
            </div>

            {activeTab === 'curriculum' && (
                <div className="animate-fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Course Content</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="action-btn-outline"><Plus size={18} /> New Module</button>
                            <button className="btn-standard" style={{ background: '#1a4d3e', display: 'flex', gap: '8px' }}><Calendar size={18} /> Schedule Live</button>
                        </div>
                    </div>

                    {modules.map(mod => (
                        <div key={mod.id} className="module-card">
                            <div className="module-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <GripVertical size={20} color="#94a3b8" />
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mod.title}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="action-icon-btn"><Edit3 size={16} /></button>
                                    <button className="action-icon-btn"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="module-body">
                                {mod.sessions.map(session => (
                                    <div key={session.id} className="session-row">
                                        <GripVertical size={18} color="#cbd5e1" />
                                        <div className={`icon-box type-${session.type}`}>
                                            {session.type === 'video' && <Video size={18} />}
                                            {session.type === 'live' && <Users size={18} />}
                                            {session.type === 'material' && <FileText size={18} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{session.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '2px' }}>
                                                {session.type === 'video' && <span>{session.duration} • MP4 Video</span>}
                                                {session.type === 'live' && <span>{session.time} • {session.platform}</span>}
                                                {session.type === 'material' && <span>{session.format}</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="action-icon-btn"><Edit3 size={16} /></button>
                                            <button className="action-icon-btn"><MoreVertical size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: '1rem 1.5rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
                                    <button style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: '#1a4d3e', fontWeight: 600 }}>+ Add Content</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
