import { useState } from 'react';
import {
    Plus,
    Layers,
    Users,
    Activity,
    BarChart3,
    Settings,
    ShieldCheck,
    ChevronRight,
    PlusCircle,
    Copy,
    Video,
    FileText,
    Globe,
    ArrowLeft,
    MoreHorizontal
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function CohortDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data for a cohort shell
    const [cohort, setCohort] = useState({
        id: id || 'CH-WLB-JAN',
        name: 'Masterclass Batch Jan 2026',
        status: 'Active',
        startDate: 'Jan 15, 2026',
        endDate: 'Mar 20, 2026',
        studentsCount: 124,
        capacity: 150,
        revenue: '$24,676.00',
        course: null as any // Set to null to show initial empty state
    });

    const mockCourse = {
        title: "Executive Brand Systems",
        description: "Master the logic of premium brand architecture and visual systems.",
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
    };

    const handleAttachCourse = () => {
        // Toggle mock state for testing or redirect
        setCohort({ ...cohort, course: mockCourse });
        setActiveTab('curriculum');
    };

    return (
        <div className="cohort-details-page">
            <style>{`
                .cohort-header-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
                }

                .badge-premium {
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-active { background: #f0fdf4; color: #1a4d3e; border: 1px solid #1a4d3e20; }

                .stat-box-strip {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .stat-box-mini {
                    padding: 1rem 1.5rem;
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 18px;
                    min-width: 140px;
                }

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

                /* Empty State Styles */
                .empty-payload-card {
                    background: white;
                    border: 2px dashed #f1f5f9;
                    border-radius: 32px;
                    padding: 5rem 3rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: fadeInUp 0.6s ease-out;
                }

                .empty-icon-shell {
                    width: 90px;
                    height: 90px;
                    background: #f8fafc;
                    border-radius: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: #cbd5e1;
                }

                .empty-payload-card h2 {
                    font-size: 2rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                }

                .empty-payload-card p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    max-width: 480px;
                    margin: 0 0 3rem 0;
                }

                .option-cluster {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    width: 100%;
                    max-width: 700px;
                }

                .option-card {
                    background: #fcfdfe;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    padding: 2rem;
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .option-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
                    border-color: #1a4d3e40;
                }

                .option-card h4 {
                    margin: 1.5rem 0 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .option-description {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .btn-primary-forest {
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    padding: 0.85rem 1.75rem;
                    border-radius: 16px;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .btn-secondary-outline {
                    background: transparent;
                    color: #475569;
                    border: 1.5px solid #f1f5f9;
                    padding: 0.85rem 1.75rem;
                    border-radius: 16px;
                    font-weight: 950;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                }

                .btn-secondary-outline:hover {
                    background: #fcfdfe;
                    border-color: #cbd5e1;
                }

                /* Curriculum Attached Styles */
                .module-card-premium {
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .module-header-premium {
                    padding: 1.5rem 2.5rem;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <Link to="/instructor/cohorts" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Cohort Distribution Inventory
            </Link>

            <div className="cohort-header-premium shadow-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                            <span className="badge-premium status-active">{cohort.status} Operational Shell</span>
                            <span style={{ fontSize: '0.9rem', color: '#1a4d3e', fontWeight: 950, background: '#f0fdf4', padding: '4px 12px', borderRadius: '8px' }}>{cohort.id}</span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.04em' }}>{cohort.name}</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>Operational Lifecycle: {cohort.startDate} — {cohort.endDate}</p>

                        <div className="stat-box-strip">
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Enrolled Clients</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>{cohort.studentsCount}<span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}> / {cohort.capacity}</span></div>
                            </div>
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Academic Payload</div>
                                <div style={{ fontWeight: 950, fontSize: '1.1rem', color: cohort.course ? '#1a4d3e' : '#ef4444' }}>{cohort.course ? 'Attached' : 'Unassigned'}</div>
                            </div>
                            <div className="stat-box-mini">
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>Fiscal Output</div>
                                <div style={{ fontWeight: 950, fontSize: '1.25rem', color: '#0f172a' }}>{cohort.revenue}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-secondary-outline"><Settings size={18} /> Logistics</button>
                        <button className="btn-primary-forest"><Globe size={18} /> Deploy Updates</button>
                    </div>
                </div>
            </div>

            <div className="management-tabs-premium">
                <div className={`tab-premium ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={18} /> Overview</div>
                <div className={`tab-premium ${activeTab === 'curriculum' ? 'active' : ''}`} onClick={() => setActiveTab('curriculum')}><Layers size={18} /> Curriculum Assets</div>
                <div className={`tab-premium ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><Users size={18} /> Enrolled Cohort</div>
                <div className={`tab-premium ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart3 size={18} /> Performance Metrics</div>
            </div>

            {cohort.course === null ? (
                <div className="empty-payload-card">
                    <div className="empty-icon-shell shadow-premium">
                        <Layers size={48} />
                    </div>
                    <h2>Academic Payload Required</h2>
                    <p>This operational shell has been successfully deployed, but does not yet have an active academic course assigned.</p>

                    <div className="option-cluster">
                        <div className="option-card shadow-premium" onClick={() => navigate(`/instructor/cohorts/${cohort.id}/attach-course`)}>
                            <div>
                                <PlusCircle size={32} color="#1a4d3e" />
                                <h4>Create Fresh Payload</h4>
                                <p className="option-description">Build a unique curriculum blueprint specifically bounded to this cohort shell.</p>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" style={{ alignSelf: 'flex-end' }} />
                        </div>

                        <div className="option-card shadow-premium" onClick={handleAttachCourse}>
                            <div>
                                <Copy size={32} color="#1a4d3e" />
                                <h4>Attach Global Template</h4>
                                <p className="option-description">Select an existing blueprint from your library to clone into this operational environment.</p>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" style={{ alignSelf: 'flex-end' }} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="attached-payload-view animate-fade-in-up">
                    {activeTab === 'curriculum' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, color: '#0f172a' }}>Bounded Curriculum Blueprint</h2>
                                <button className="btn-primary-forest" style={{ padding: '0.7rem 1.5rem' }}><Plus size={18} /> Add Module</button>
                            </div>

                            {cohort.course.modules.map((mod: any) => (
                                <div key={mod.id} className="module-card-premium shadow-premium">
                                    <div className="module-header-premium">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <Layers size={22} color="#1a4d3e" />
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: '#0f172a' }}>{mod.title}</h3>
                                        </div>
                                        <MoreHorizontal size={24} color="#94a3b8" />
                                    </div>
                                    <div className="module-body">
                                        {mod.sessions.map((sess: any) => (
                                            <div key={sess.id} style={{ padding: '1.25rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1.5px solid #f8fafc' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a4d3e' }}>
                                                    {sess.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 850, fontSize: '1rem', color: '#0f172a' }}>{sess.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>{sess.duration || sess.type} Assets</div>
                                                </div>
                                                <button className="btn-secondary-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Edit Resource</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'overview' && (
                        <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="stat-card-premium-inventory" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #f1f5f9' }}>
                                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 950, color: '#0f172a' }}>Academic Integrity</h4>
                                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1rem' }}>This shell is currently bound to the <strong>{cohort.course.title}</strong> blueprint. All intellectual data is isolated to this operational instance.</p>
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShieldCheck size={28} color="#1a4d3e" />
                                    <span style={{ fontWeight: 850, color: '#1a4d3e' }}>Cross-contamination protection enabled.</span>
                                </div>
                            </div>
                            <div className="management-card" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #f1f5f9' }}>
                                <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 950, color: '#0f172a' }}>Enrollment Performance</h4>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '140px', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Retention</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', marginTop: '4px' }}>94.2%</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '140px', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Engagement</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1a4d3e', marginTop: '4px' }}>High</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

