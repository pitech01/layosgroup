import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Video,
    FileText,
    HelpCircle,
    Trash2,
    GripVertical,
    Edit2,
    Clock,
    Eye,
    UploadCloud,
    X,
    Layout,
    Activity,
    PlusCircle,
    Check,
    ChevronDown
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

// --- TYPES ---
type SessionType = 'video' | 'live' | 'docs' | 'assessment';

interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
}

interface Session {
    id: string;
    module_id: string;
    title: string;
    description: string;
    type: SessionType;
    order_position: number;
    preview_enabled: boolean;
    is_locked: boolean;
    // Polymorphic Data
    video_url?: string;
    duration?: string;
    start_time?: string;
    platform?: string;
    meeting_link?: string;
    file_url?: string;
    file_type?: string;
    pass_mark?: number;
    questions?: QuizQuestion[];
}

interface Module {
    id: string;
    title: string;
    order_position: number;
    sessions: Session[];
    isOpen: boolean;
}

// --- CURRICULUM BUILDER COMPONENT ---
export default function CurriculumBuilder() {
    const { id: courseId } = useParams();
    const [modules, setModules] = useState<Module[]>([]);
    const [courseInfo] = useState({ title: 'Executive Brand Systems', status: 'draft' });
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [deliveryMode, setDeliveryMode] = useState('Course Planning');

    // UI state for Modals
    const [activeModal, setActiveModal] = useState<{
        isOpen: boolean,
        type: SessionType | null,
        moduleId: string | null,
        sessionToEdit: Session | null
    }>({
        isOpen: false,
        type: null,
        moduleId: null,
        sessionToEdit: null
    });

    // --- MOCK API SERVICE ---
    const api = {
        saveCurriculum: async (data: Module[]) => {
            setSaveStatus('saving');
            await new Promise(r => setTimeout(r, 600));
            localStorage.setItem(`course_${courseId}_curriculum`, JSON.stringify(data));
            setSaveStatus('saved');
        },
        loadCurriculum: () => {
            const saved = localStorage.getItem(`course_${courseId}_curriculum`);
            return saved ? JSON.parse(saved) : [
                { id: 'm1', title: 'Module 1: Getting Started', order_position: 1, isOpen: true, sessions: [] }
            ];
        }
    };

    useEffect(() => {
        setModules(api.loadCurriculum());
    }, [courseId]);

    useEffect(() => {
        if (modules.length > 0) {
            api.saveCurriculum(modules);
            const allSessions = modules.flatMap(m => m.sessions);
            const types = new Set(allSessions.map(s => s.type));
            if (types.has('live') && types.has('video')) setDeliveryMode('Hybrid Delivery');
            else if (types.has('live')) setDeliveryMode('Live Sessions');
            else if (types.has('video')) setDeliveryMode('Self-paced');
            else if (allSessions.length > 0) setDeliveryMode('Resources Only');
            else setDeliveryMode('Drafting');
        }
    }, [modules]);

    const handleAddModule = () => {
        setModules([...modules, {
            id: `mod_${Date.now()}`,
            title: 'New Course Module',
            order_position: modules.length + 1,
            isOpen: true,
            sessions: []
        }]);
    };

    const handleEditModuleTitle = (modId: string, newTitle: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, title: newTitle } : m));
    };

    const handleDeleteModule = (modId: string) => {
        if (window.confirm('Are you sure you want to delete this module? All lessons within it will be removed.')) {
            setModules(modules.filter(m => m.id !== modId));
        }
    };

    const toggleModule = (modId: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, isOpen: !m.isOpen } : m));
    };

    const handleOpenAddSession = (modId: string) => {
        setActiveModal({ isOpen: true, type: null, moduleId: modId, sessionToEdit: null });
    };

    const handleOpenEditSession = (modId: string, session: Session) => {
        setActiveModal({ isOpen: true, type: session.type, moduleId: modId, sessionToEdit: session });
    };

    const handleDeleteSession = (modId: string, sessId: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, sessions: m.sessions.filter(s => s.id !== sessId) } : m));
    };

    const handleSaveSession = (sessionData: Partial<Session>) => {
        const { moduleId, sessionToEdit, type } = activeModal;
        if (!moduleId) return;

        setModules(modules.map(m => {
            if (m.id === moduleId) {
                if (sessionToEdit) {
                    return { ...m, sessions: m.sessions.map(s => s.id === sessionToEdit.id ? { ...s, ...sessionData } as Session : s) };
                } else {
                    const newSession: Session = {
                        id: `sess_${Date.now()}`,
                        module_id: moduleId,
                        title: sessionData.title || 'Untitled Lesson',
                        description: sessionData.description || '',
                        type: type!,
                        order_position: m.sessions.length + 1,
                        preview_enabled: sessionData.preview_enabled || false,
                        is_locked: sessionData.is_locked ?? true,
                        ...sessionData
                    } as Session;
                    return { ...m, sessions: [...m.sessions, newSession] };
                }
            }
            return m;
        }));
        setActiveModal({ isOpen: false, type: null, moduleId: null, sessionToEdit: null });
    };

    return (
        <div className="curriculum-container">
            <style>{`
                .curriculum-container { min-height: 100vh; background: #fcfdfe; color: #0f172a; padding-bottom: 5rem; }
                .curriculum-header { background: white; padding: 1.25rem 4rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(226, 232, 240, 0.7); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .header-brand { display: flex; align-items: center; gap: 2rem; }
                .exit-btn { width: 44px; height: 44px; border-radius: 14px; background: #f8fafc; border: 1.5px solid #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; text-decoration: none; }
                .exit-btn:hover { background: #1a4d3e; color: white; border-color: #1a4d3e; transform: translateX(-4px); }
                .header-title-row { display: flex; alignItems: center; gap: 16px; }
                .header-title-row h1 { font-size: 1.4rem; font-weight: 950; margin: 0; color: #0f172a; letter-spacing: -0.02em; }
                .badge-blueprint { background: #f0fdf4; color: #1a4d3e; font-size: 0.75rem; font-weight: 900; padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #1a4d3e10; }
                .save-status { font-size: 0.8rem; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 8px; margin-top: 6px; }
                .save-status.saving { color: #1a4d3e; }
                .header-actions { display: flex; gap: 1.25rem; }
                
                .btn-primary-forest { background: #1a4d3e; color: white; border: none; padding: 0.85rem 2rem; border-radius: 16px; font-weight: 900; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2); }
                .btn-primary-forest:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -5px rgba(26, 77, 62, 0.25); }
                .btn-outline-premium { background: white; color: #475569; border: 2.5px solid #f1f5f9; padding: 0.85rem 1.75rem; border-radius: 16px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .btn-outline-premium:hover { border-color: #1a4d3e30; background: #fcfdfe; color: #1a4d3e; }

                .curriculum-canvas { max-width: 1000px; margin: 5rem auto; padding: 0 3rem; }
                .canvas-header { margin-bottom: 4rem; }
                .canvas-header h2 { font-size: 2.5rem; font-weight: 950; margin-bottom: 0.75rem; color: #0f172a; letter-spacing: -0.04em; }
                .canvas-header p { color: #64748b; font-weight: 600; font-size: 1.15rem; line-height: 1.6; }

                .modules-list { display: flex; flex-direction: column; gap: 2.5rem; }
                .module-box { background: white; border-radius: 32px; border: 1.5px solid rgba(226, 232, 240, 0.8); overflow: hidden; transition: all 0.4s; }
                .module-box.expanded { border-color: #1a4d3e15; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.04); }
                
                .module-top { padding: 2.25rem 2.5rem; display: flex; align-items: center; gap: 2rem; cursor: pointer; background: #fcfdfe; }
                .module-top:hover { background: #f8fafc; }
                .drag-handle { color: #cbd5e1; cursor: grab; }
                .module-title-zone { flex: 1; display: flex; flex-direction: column; }
                .module-title-input { font-size: 1.35rem; font-weight: 950; border: none; background: transparent; padding: 6px 0; outline: none; transition: border 0.2s; border-bottom: 2.5px solid transparent; color: #0f172a; letter-spacing: -0.02em; }
                .module-title-input:focus { border-bottom-color: #1a4d3e; }
                .module-meta { font-size: 0.85rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
                
                .module-controls { display: flex; align-items: center; gap: 1.5rem; }
                .ctrl-btn { border: none; background: transparent; padding: 10px; border-radius: 12px; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
                .ctrl-btn.delete:hover { background: #fef2f2; color: #ef4444; }
                
                .module-body { padding: 0 2.5rem 2.5rem 2.5rem; border-top: 1.5px solid rgba(241, 245, 249, 0.8); background: white; }
                .sessions-container { display: flex; flex-direction: column; gap: 1rem; padding: 2.5rem 0; }
                
                .session-item { background: white; border: 1.5px solid #f1f5f9; padding: 1.5rem 2.5rem; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
                .session-item:hover { transform: translateX(10px); border-color: #1a4d3e30; box-shadow: 0 10px 25px -5px rgba(26,77,62,0.05); }
                .session-left { display: flex; align-items: center; gap: 2rem; }
                .session-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
                .session-icon.video { background: #eff6ff; color: #1d4ed8; }
                .session-icon.live { background: #fef2f2; color: #b91c1c; }
                .session-icon.docs { background: #f0fdf4; color: #166534; }
                .session-icon.assessment { background: #fefce8; color: #854d0e; }
                .session-text h4 { font-size: 1.15rem; font-weight: 900; margin: 0; color: #0f172a; }
                .session-text p { font-size: 0.85rem; font-weight: 800; color: #64748b; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em; }

                .add-module-master { width: 100%; padding: 3rem; border-radius: 40px; border: 3px dashed rgba(26, 77, 62, 0.2); background: white; color: #1a4d3e; font-size: 1.35rem; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 20px; cursor: pointer; transition: all 0.4s; margin-top: 4rem; }
                .add-module-master:hover { background: #f0fdf4; border-color: #1a4d3e60; transform: translateY(-8px); box-shadow: 0 30px 60px -15px rgba(26, 77, 62, 0.1); }

                /* MODAL SYSTEM */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .modal-content { background: white; border-radius: 52px; width: 100%; max-width: 1000px; max-height: 94vh; overflow-y: auto; position: relative; box-shadow: 0 60px 120px -30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
                .session-selector { padding: 6rem; text-align: center; }
                .session-selector h3 { font-size: 2.75rem; font-weight: 950; margin-bottom: 1.5rem; color: #0f172a; letter-spacing: -0.04em; }
                .selector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-top: 5rem; }
                .select-opt { padding: 3.5rem; border: 3px solid #f1f5f9; border-radius: 44px; text-align: left; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .select-opt:hover { border-color: #1a4d3e; background: #f0fdf4; transform: scale(1.02) translateY(-10px); }
                .select-opt h4 { font-size: 1.5rem; font-weight: 950; margin: 2rem 0 0.75rem 0; color: #0f172a; }
                .select-opt p { color: #64748b; font-weight: 600; line-height: 1.5; }
                .modal-close { position: absolute; top: 3rem; right: 3rem; border: none; background: #f1f5f9; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; transition: all 0.3s; }
                .modal-close:hover { background: #fef2f2; color: #ef4444; transform: rotate(90deg); }

                /* FORMS */
                .form-wrapper { padding: 6rem; }
                .form-header { display: flex; gap: 3rem; align-items: center; margin-bottom: 5rem; }
                .form-header h2 { font-size: 2.5rem; font-weight: 950; margin: 0; color: #0f172a; letter-spacing: -0.05em; }
                .form-body { display: flex; flex-direction: column; gap: 3rem; }
                .form-input-premium { width: 100%; background: #fcfdfe; border: 2.5px solid #e2e8f0; border-radius: 20px; padding: 1.25rem 1.75rem; font-size: 1.15rem; font-weight: 700; color: #0f172a; outline: none; transition: all 0.3s; }
                .form-input-premium:focus { border-color: #1a4d3e; background: white; box-shadow: 0 0 0 8px rgba(26, 77, 62, 0.08); }
                .form-textarea-premium { width: 100%; background: #fcfdfe; border: 2.5px solid #e2e8f0; border-radius: 20px; padding: 1.75rem; font-size: 1.15rem; font-weight: 700; color: #0f172a; outline: none; min-height: 160px; resize: none; transition: all 0.3s; }
                .form-textarea-premium:focus { border-color: #1a4d3e; background: white; box-shadow: 0 0 0 8px rgba(26, 77, 62, 0.08); }
                
                .deploy-btn-forest { background: #1a4d3e; color: white; border: none; border-radius: 24px; padding: 1.75rem 5rem; font-weight: 950; cursor: pointer; font-size: 1.25rem; box-shadow: 0 20px 40px -10px rgba(26, 77, 62, 0.4); transition: all 0.4s; }
                .deploy-btn-forest:hover { transform: translateY(-5px); box-shadow: 0 30px 60px -15px rgba(26, 77, 62, 0.5); }
            `}</style>

            <header className="curriculum-header">
                <div className="header-brand">
                    <Link to="/instructor/courses" className="exit-btn"><ChevronLeft size={24} /></Link>
                    <div className="header-info">
                        <div className="header-title-row">
                            <h1>{courseInfo.title}</h1>
                            <span className="badge-blueprint">
                                <Activity size={14} /> {deliveryMode}
                            </span>
                        </div>
                        <div className={`save-status ${saveStatus}`}>
                            {saveStatus === 'saving' ? <><Clock size={14} /> Saving Curriculum...</> : <><Check size={14} /> Curriculum Saved</>}
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-outline-premium"><Eye size={20} /> Preview</button>
                    <button className="btn-primary-forest">Publish Changes</button>
                </div>
            </header>

            <main className="curriculum-canvas">
                <div className="canvas-header">
                    <h2>Course Curriculum</h2>
                    <p>Map out the learning journey for your students. Organize content into modules and lessons to create a structured educational experience.</p>
                </div>

                <div className="modules-list">
                    {modules.map((mod) => (
                        <div key={mod.id} className={`module-box ${mod.isOpen ? 'expanded' : 'collapsed'}`}>
                            <div className="module-top" onClick={() => toggleModule(mod.id)}>
                                <div className="drag-handle"><GripVertical size={24} /></div>
                                <div className="module-title-zone">
                                    <input
                                        className="module-title-input"
                                        value={mod.title}
                                        onChange={(e) => handleEditModuleTitle(mod.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Module Title..."
                                    />
                                    <span className="module-meta">{mod.sessions.length} Lessons Added</span>
                                </div>
                                <div className="module-controls" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="ctrl-btn delete"><Trash2 size={20} /></button>
                                    <div style={{ transform: mod.isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: '#64748b' }}>
                                        <ChevronDown size={24} />
                                    </div>
                                </div>
                            </div>

                            {mod.isOpen && (
                                <div className="module-body">
                                    <div className="sessions-container">
                                        {mod.sessions.length === 0 && (
                                            <div className="empty-placeholder">No lessons added to this module yet.</div>
                                        )}
                                        {mod.sessions.map((sess) => (
                                            <div key={sess.id} className="session-item">
                                                <div className="session-left">
                                                    <div className={`session-icon ${sess.type}`}>
                                                        {sess.type === 'video' && <Video size={22} />}
                                                        {sess.type === 'live' && <Activity size={22} />}
                                                        {sess.type === 'docs' && <FileText size={22} />}
                                                        {sess.type === 'assessment' && <HelpCircle size={22} />}
                                                    </div>
                                                    <div className="session-text">
                                                        <h4>{sess.title}</h4>
                                                        <p>{sess.type} • {sess.is_locked ? 'Prerequisite Required' : 'Public Access'}</p>
                                                    </div>
                                                </div>
                                                <div className="module-controls">
                                                    <button onClick={() => handleOpenEditSession(mod.id, sess)} className="ctrl-btn"><Edit2 size={18} /></button>
                                                    <button onClick={() => handleDeleteSession(mod.id, sess.id)} className="ctrl-btn delete"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleOpenAddSession(mod.id)} style={{
                                        width: '100%',
                                        padding: '1.5rem',
                                        background: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: '20px',
                                        color: '#1a4d3e',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        marginTop: '1.5rem'
                                    }} onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                                        <PlusCircle size={22} />
                                        <span>Add New Lesson</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button className="add-module-master" onClick={handleAddModule}>
                        <Layout size={32} />
                        Add New Module
                    </button>
                </div>
            </main>

            {activeModal.isOpen && (
                <div className="modal-overlay" onClick={() => setActiveModal({ ...activeModal, isOpen: false })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {!activeModal.type ? (
                            <div className="session-selector">
                                <h3>Select Lesson Type</h3>
                                <p>Choose the type of content you want to add to this module.</p>
                                <div className="selector-grid">
                                    <div className="select-opt video" onClick={() => setActiveModal({ ...activeModal, type: 'video' })}>
                                        <div className="opt-icon"><Video size={40} /></div>
                                        <h4>Video Lesson</h4>
                                        <p>Recordings or uploaded videos for students to watch at their own pace.</p>
                                    </div>
                                    <div className="select-opt live" onClick={() => setActiveModal({ ...activeModal, type: 'live' })}>
                                        <div className="opt-icon"><Activity size={40} /></div>
                                        <h4>Live Session</h4>
                                        <p>Schedule a real-time meeting or stream for direct engagement.</p>
                                    </div>
                                    <div className="select-opt docs" onClick={() => setActiveModal({ ...activeModal, type: 'docs' })}>
                                        <div className="opt-icon"><FileText size={40} /></div>
                                        <h4>Course Material</h4>
                                        <p>PDFs, documents, and resources for students to download.</p>
                                    </div>
                                    <div className="select-opt assessment" onClick={() => setActiveModal({ ...activeModal, type: 'assessment' })}>
                                        <div className="opt-icon"><HelpCircle size={40} /></div>
                                        <h4>Assessment</h4>
                                        <p>Create quizzes and tests to evaluate student understanding.</p>
                                    </div>
                                </div>
                                <button className="modal-close" onClick={() => setActiveModal({ ...activeModal, isOpen: false })}><X size={32} /></button>
                            </div>
                        ) : (
                            <SessionForm
                                type={activeModal.type}
                                initialData={activeModal.sessionToEdit}
                                onCancel={() => setActiveModal({ ...activeModal, type: null })}
                                onSave={handleSaveSession}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}



function SessionForm({ type, initialData, onCancel, onSave }: { type: SessionType, initialData: Session | null, onCancel: () => void, onSave: (data: Partial<Session>) => void }) {
    const [formData, setFormData] = useState<Partial<Session>>(initialData || {
        title: '',
        description: '',
        preview_enabled: false,
        is_locked: true,
        type: type,
        questions: []
    });

    const [assessmentFields, setAssessmentFields] = useState({
        pass_mark: initialData?.pass_mark || 80,
        questions: initialData?.questions || []
    });

    const handleFieldChange = (field: keyof Session, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const addQuestion = () => {
        setAssessmentFields({
            ...assessmentFields,
            questions: [...assessmentFields.questions, { id: `q_${Date.now()}`, text: '', options: ['', '', '', ''], correctIndex: 0 }]
        });
    };

    const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) => {
        setAssessmentFields({
            ...assessmentFields,
            questions: assessmentFields.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
        });
    };

    const handleSubmit = () => {
        const payload = { ...formData };
        if (type === 'assessment') {
            payload.pass_mark = assessmentFields.pass_mark;
            payload.questions = assessmentFields.questions;
        }
        onSave(payload);
    };

    return (
        <div className="form-wrapper">
            <header className="form-header">
                <div className={`form-icon ${type}`}>
                    {type === 'video' && <Video size={36} />}
                    {type === 'live' && <Activity size={36} />}
                    {type === 'docs' && <FileText size={36} />}
                    {type === 'assessment' && <HelpCircle size={36} />}
                </div>
                <div>
                    <h2>{initialData ? 'Update Lesson' : `Add New ${type === 'docs' ? 'Resource' : type}`}</h2>
                    <p>Configure the details for this curriculum unit.</p>
                </div>
            </header>

            <div className="form-body">
                <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', display: 'block' }}>Lesson Title</label>
                    <input className="form-input-premium" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} placeholder="e.g. Introduction to Course" />
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', display: 'block' }}>Description</label>
                    <textarea className="form-textarea-premium" value={formData.description} onChange={e => handleFieldChange('description', e.target.value)} placeholder="Describe what students will learn in this session..." />
                </div>

                {type === 'video' && (
                    <div className="upload-box">
                        <UploadCloud size={56} color="#1a4d3e" />
                        <h4>Upload Video Lesson</h4>
                        <p>MP4, MOV or link to external video sources.</p>
                    </div>
                )}

                {type === 'live' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 900, color: '#475569', marginBottom: '8px', display: 'block' }}>Live Platform</label>
                            <select className="form-input-premium">
                                <option>Internal Stream</option>
                                <option>Zoom</option>
                                <option>Google Meet</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 900, color: '#475569', marginBottom: '8px', display: 'block' }}>Meeting Link</label>
                            <input className="form-input-premium" placeholder="https://..." />
                        </div>
                    </div>
                )}

                {type === 'assessment' && (
                    <div className="questions-builder">
                        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '2px solid #e2e8f0' }}>
                            <label style={{ fontWeight: 900, color: '#0f172a' }}>Passing Grade: {assessmentFields.pass_mark}%</label>
                            <input type="range" min="0" max="100" step="5" value={assessmentFields.pass_mark} onChange={e => setAssessmentFields({ ...assessmentFields, pass_mark: parseInt(e.target.value) })} style={{ width: '100%', marginTop: '1rem', accentColor: '#1a4d3e' }} />
                        </div>

                        {assessmentFields.questions.map((q, idx) => (
                            <div key={q.id} className="q-card">
                                <div className="q-header">
                                    <span>Question {idx + 1}</span>
                                    <button onClick={() => setAssessmentFields({ ...assessmentFields, questions: assessmentFields.questions.filter(x => x.id !== q.id) })} className="del-btn"><Trash2 size={16} /></button>
                                </div>
                                <input className="form-input-premium" style={{ marginBottom: '1.5rem' }} value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} placeholder="Enter your question here..." />
                                <div className="options-grid">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`opt-row ${q.correctIndex === oIdx ? 'correct' : ''}`}>
                                            <input type="radio" checked={q.correctIndex === oIdx} onChange={() => updateQuestion(q.id, { correctIndex: oIdx })} />
                                            <input type="text" value={opt} onChange={e => {
                                                const newOpts = [...q.options];
                                                newOpts[oIdx] = e.target.value;
                                                updateQuestion(q.id, { options: newOpts });
                                            }} placeholder={`Option ${oIdx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button className="add-q-btn" onClick={addQuestion}><PlusCircle size={20} /> Add Question</button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '3rem', paddingTop: '3rem', borderTop: '2.5px solid #f1f5f9' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>Preview Access</label>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Allow students to view this lesson before enrolling.</p>
                        <input type="checkbox" checked={formData.preview_enabled} onChange={e => handleFieldChange('preview_enabled', e.target.checked)} style={{ marginTop: '12px', width: '24px', height: '24px', accentColor: '#1a4d3e' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>Lock Lesson</label>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Require completion of previous lessons.</p>
                        <input type="checkbox" checked={formData.is_locked} onChange={e => handleFieldChange('is_locked', e.target.checked)} style={{ marginTop: '12px', width: '24px', height: '24px', accentColor: '#1a4d3e' }} />
                    </div>
                </div>
            </div>

            <footer style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end', gap: '2rem', background: 'white', padding: '2.5rem 0', borderTop: '2px solid #f1f5f9', position: 'sticky', bottom: 0 }}>
                <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 900, cursor: 'pointer', fontSize: '1.1rem' }}>Cancel</button>
                <button className="deploy-btn-forest" onClick={handleSubmit}>Save to Module</button>
            </footer>
        </div>
    );
}
