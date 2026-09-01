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
type SessionType = 'video' | 'live' | 'docs' | 'evaluation';

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
                .staff-scope .curriculum-container { min-height: 100vh; background: var(--index-card-bg); color: var(--index-text-heading); padding-bottom: 5rem; }
                .staff-scope .curriculum-header { background: white; padding: 1.25rem 4rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid color-mix(in srgb, var(--index-border-color) 70%, transparent); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .staff-scope .header-brand { display: flex; align-items: center; gap: 2rem; }
                .staff-scope .exit-btn { width: 44px; height: 44px; border-radius: 14px; background: var(--index-hover-bg); border: 1.5px solid var(--index-hover-bg); display: flex; align-items: center; justify-content: center; color: var(--index-text-secondary); transition: all 0.2s; text-decoration: none; }
                .exit-btn:hover { background: var(--index-primary-color); color: white; border-color: var(--index-primary-color); transform: translateX(-4px); }
                .staff-scope .header-title-row { display: flex; alignItems: center; gap: 16px; }
                .header-title-row h1 { font-size: 1.4rem; font-weight: 950; margin: 0; color: var(--index-text-heading); letter-spacing: -0.02em; }
                .staff-scope .badge-blueprint { background: var(--index-accent-soft-bg); color: var(--index-primary-color); font-size: 0.75rem; font-weight: 900; padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid var(--index-primary-color)10; }
                .staff-scope .save-status { font-size: 0.8rem; font-weight: 800; color: var(--index-text-faint); display: flex; align-items: center; gap: 8px; margin-top: 6px; }
                .save-status.saving { color: var(--index-primary-color); }
                .staff-scope .header-actions { display: flex; gap: 1.25rem; }
                
                .staff-scope .btn-primary-forest { background: var(--index-primary-color); color: white; border: none; padding: 0.85rem 2rem; border-radius: 16px; font-weight: 900; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--index-primary-color) 20%, transparent); }
                .btn-primary-forest:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -5px color-mix(in srgb, var(--index-primary-color) 25%, transparent); }
                .staff-scope .btn-outline-premium { background: white; color: var(--index-text-secondary); border: 2.5px solid var(--index-hover-bg); padding: 0.85rem 1.75rem; border-radius: 16px; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .btn-outline-premium:hover { border-color: var(--index-primary-color)30; background: var(--index-card-bg); color: var(--index-primary-color); }

                .staff-scope .curriculum-canvas { max-width: 1000px; margin: 5rem auto; padding: 0 3rem; }
                .staff-scope .canvas-header { margin-bottom: 4rem; }
                .canvas-header h2 { font-size: 2.5rem; font-weight: 950; margin-bottom: 0.75rem; color: var(--index-text-heading); letter-spacing: -0.04em; }
                .canvas-header p { color: var(--index-text-secondary); font-weight: 600; font-size: 1.15rem; line-height: 1.6; }

                .staff-scope .modules-list { display: flex; flex-direction: column; gap: 2.5rem; }
                .staff-scope .module-box { background: white; border-radius: 32px; border: 1.5px solid color-mix(in srgb, var(--index-border-color) 80%, transparent); overflow: hidden; transition: all 0.4s; }
                .module-box.expanded { border-color: var(--index-primary-color)15; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.04); }
                
                .staff-scope .module-top { padding: 2.25rem 2.5rem; display: flex; align-items: center; gap: 2rem; cursor: pointer; background: var(--index-card-bg); }
                .module-top:hover { background: var(--index-hover-bg); }
                .staff-scope .drag-handle { color: var(--index-border-subtle); cursor: grab; }
                .staff-scope .module-title-zone { flex: 1; display: flex; flex-direction: column; }
                .staff-scope .module-title-input { font-size: 1.35rem; font-weight: 950; border: none; background: transparent; padding: 6px 0; outline: none; transition: border 0.2s; border-bottom: 2.5px solid transparent; color: var(--index-text-heading); letter-spacing: -0.02em; }
                .module-title-input:focus { border-bottom-color: var(--index-primary-color); }
                .staff-scope .module-meta { font-size: 0.85rem; font-weight: 800; color: var(--index-text-faint); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
                
                .staff-scope .module-controls { display: flex; align-items: center; gap: 1.5rem; }
                .staff-scope .ctrl-btn { border: none; background: transparent; padding: 10px; border-radius: 12px; cursor: pointer; color: var(--index-text-faint); transition: all 0.2s; }
                .ctrl-btn.delete:hover { background: var(--index-danger-bg-soft); color: var(--lgl-error); }
                
                .staff-scope .module-body { padding: 0 2.5rem 2.5rem 2.5rem; border-top: 1.5px solid color-mix(in srgb, var(--index-hover-bg) 80%, transparent); background: white; }
                .staff-scope .sessions-container { display: flex; flex-direction: column; gap: 1rem; padding: 2.5rem 0; }
                
                .staff-scope .session-item { background: white; border: 1.5px solid var(--index-hover-bg); padding: 1.5rem 2.5rem; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
                .session-item:hover { transform: translateX(10px); border-color: var(--index-primary-color)30; box-shadow: 0 10px 25px -5px color-mix(in srgb, var(--index-primary-color) 5%, transparent); }
                .staff-scope .session-left { display: flex; align-items: center; gap: 2rem; }
                .staff-scope .session-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
                .staff-scope .session-icon.video { background: var(--index-accent-soft-bg); color: var(--index-primary-color); }
                .staff-scope .session-icon.live { background: var(--index-danger-bg-soft); color: var(--lgl-error); }
               .staff-scope  .session-icon.docs { background: var(--index-accent-soft-bg); color: var(--lgl-success); }
                .staff-scope .session-icon.evaluation { background: color-mix(in srgb, var(--lgl-warning) 15%, transparent); color: var(--lgl-warning); }
                .staff-scope .session-text h4 { font-size: 1.15rem; font-weight: 900; margin: 0; color: var(--index-text-heading); }
                .staff-scope .session-text p { font-size: 0.85rem; font-weight: 800; color: var(--index-text-secondary); margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em; }

                .staff-scope .add-module-master { width: 100%; padding: 3rem; border-radius: 40px; border: 3px dashed color-mix(in srgb, var(--index-primary-color) 20%, transparent); background: white; color: var(--index-primary-color); font-size: 1.35rem; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 20px; cursor: pointer; transition: all 0.4s; margin-top: 4rem; }
                .add-module-master:hover { background: var(--index-accent-soft-bg); border-color: var(--index-primary-color)60; transform: translateY(-8px); box-shadow: 0 30px 60px -15px color-mix(in srgb, var(--index-primary-color) 10%, transparent); }

                /* MODAL SYSTEM */
                .staff-scope .modal-overlay { position: fixed; inset: 0; background: color-mix(in srgb, var(--lgl-charcoal) 80%, transparent); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .staff-scope .modal-content { background: white; border-radius: 52px; width: 100%; max-width: 1000px; max-height: 94vh; overflow-y: auto; position: relative; box-shadow: 0 60px 120px -30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
                .staff-scope .session-selector { padding: 6rem; text-align: center; }
                .staff-scope .session-selector h3 { font-size: 2.75rem; font-weight: 950; margin-bottom: 1.5rem; color: var(--index-text-heading); letter-spacing: -0.04em; }
                .staff-scope .selector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-top: 5rem; }
                .staff-scope .select-opt { padding: 3.5rem; border: 3px solid var(--index-hover-bg); border-radius: 44px; text-align: left; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .select-opt:hover { border-color: var(--index-primary-color); background: var(--index-accent-soft-bg); transform: scale(1.02) translateY(-10px); }
               .staff-scope  .select-opt h4 { font-size: 1.5rem; font-weight: 950; margin: 2rem 0 0.75rem 0; color: var(--index-text-heading); }
               .staff-scope  .select-opt p { color: var(--index-text-secondary); font-weight: 600; line-height: 1.5; }
                .staff-scope .modal-close { position: absolute; top: 3rem; right: 3rem; border: none; background: var(--index-hover-bg); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--index-text-secondary); cursor: pointer; transition: all 0.3s; }
                .staff-scope .modal-close:hover { background: var(--index-danger-bg-soft); color: var(--lgl-error); transform: rotate(90deg); }

                /* FORMS */
                .staff-scope .form-wrapper { padding: 6rem; }
                .staff-scope .form-header { display: flex; gap: 3rem; align-items: center; margin-bottom: 5rem; }
                .staff-scope .form-header h2 { font-size: 2.5rem; font-weight: 950; margin: 0; color: var(--index-text-heading); letter-spacing: -0.05em; }
                .staff-scope .form-body { display: flex; flex-direction: column; gap: 3rem; }
                .staff-scope .form-input-premium { width: 100%; background: var(--index-card-bg); border: 2.5px solid var(--index-border-color); border-radius: 20px; padding: 1.25rem 1.75rem; font-size: 1.15rem; font-weight: 700; color: var(--index-text-heading); outline: none; transition: all 0.3s; }

                .staff-scope .form-input-premium:focus { border-color: var(--index-primary-color); background: white; box-shadow: 0 0 0 8px color-mix(in srgb, var(--index-primary-color) 8%, transparent); }
                .staff-scope .form-textarea-premium { width: 100%; background: var(--index-card-bg); border: 2.5px solid var(--index-border-color); border-radius: 20px; padding: 1.75rem; font-size: 1.15rem; font-weight: 700; color: var(--index-text-heading); outline: none; min-height: 160px; resize: none; transition: all 0.3s; }
                .staff-scope .form-textarea-premium:focus { border-color: var(--index-primary-color); background: white; box-shadow: 0 0 0 8px color-mix(in srgb, var(--index-primary-color) 8%, transparent); }
                
                .staff-scope .deploy-btn-forest { background: var(--index-primary-color); color: white; border: none; border-radius: 24px; padding: 1.75rem 5rem; font-weight: 950; cursor: pointer; font-size: 1.25rem; box-shadow: 0 20px 40px -10px color-mix(in srgb, var(--index-primary-color) 40%, transparent); transition: all 0.4s; }

                .staff-scope .deploy-btn-forest:hover { transform: translateY(-5px); box-shadow: 0 30px 60px -15px color-mix(in srgb, var(--index-primary-color) 50%, transparent); }
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
                                    <div style={{ transform: mod.isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', color: 'var(--index-text-secondary)' }}>
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
                                                        {sess.type === 'evaluation' && <HelpCircle size={22} />}
                                                    </div>
                                                    <div className="session-text">
                                                        <h4>{sess.title}</h4>
                                                        <p>{sess.type === 'evaluation' ? 'Evaluation' : sess.type} • {sess.is_locked ? 'Prerequisite Required' : 'Public Access'}</p>
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
                                        background: 'var(--index-hover-bg)',
                                        border: '2px dashed var(--index-border-color)',
                                        borderRadius: '20px',
                                        color: 'var(--index-primary-color)',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        marginTop: '1.5rem'
                                    }} onMouseOver={e => e.currentTarget.style.background = 'var(--index-accent-soft-bg)'} onMouseOut={e => e.currentTarget.style.background = 'var(--index-hover-bg)'}>
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
                                    <div className="select-opt evaluation" onClick={() => setActiveModal({ ...activeModal, type: 'evaluation' })}>
                                        <div className="opt-icon"><HelpCircle size={40} /></div>
                                        <h4>Evaluation</h4>
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

    const [evaluationFields, setEvaluationFields] = useState({
        pass_mark: initialData?.pass_mark || 80,
        questions: initialData?.questions || []
    });

    const handleFieldChange = (field: keyof Session, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const addQuestion = () => {
        setEvaluationFields({
            ...evaluationFields,
            questions: [...evaluationFields.questions, { id: `q_${Date.now()}`, text: '', options: ['', '', '', ''], correctIndex: 0 }]
        });
    };

    const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) => {
        setEvaluationFields({
            ...evaluationFields,
            questions: evaluationFields.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
        });
    };

    const handleSubmit = () => {
        const payload = { ...formData };
        if (type === 'evaluation') {
            payload.pass_mark = evaluationFields.pass_mark;
            payload.questions = evaluationFields.questions;
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
                    {type === 'evaluation' && <HelpCircle size={36} />}
                </div>
                <div>
                    <h2>{initialData ? 'Update Lesson' : `Add New ${type === 'docs' ? 'Resource' : (type === 'evaluation' ? 'Evaluation' : type)}`}</h2>
                    <p>Configure the details for this curriculum unit.</p>
                </div>
            </header>

            <div className="form-body">
                <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', display: 'block' }}>Lesson Title</label>
                    <input className="form-input-premium" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} placeholder="e.g. Introduction to Course" />
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--index-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', display: 'block' }}>Description</label>
                    <textarea className="form-textarea-premium" value={formData.description} onChange={e => handleFieldChange('description', e.target.value)} placeholder="Describe what students will learn in this session..." />
                </div>

                {type === 'video' && (
                    <div className="upload-box">
                        <UploadCloud size={56} color="var(--index-primary-color)" />
                        <h4>Upload Video Lesson</h4>
                        <p>MP4, MOV or link to external video sources.</p>
                    </div>
                )}

                {type === 'live' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--index-text-secondary)', marginBottom: '8px', display: 'block' }}>Live Platform</label>
                            <select className="form-input-premium">
                                <option>Microsoft Teams</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--index-text-secondary)', marginBottom: '8px', display: 'block' }}>Meeting Link</label>
                            <input className="form-input-premium" placeholder="https://..." />
                        </div>
                    </div>
                )}

                {type === 'evaluation' && (
                    <div className="questions-builder">
                        <div style={{ padding: '2rem', background: 'var(--index-hover-bg)', borderRadius: '24px', border: '2px solid var(--index-border-color)' }}>
                            <label style={{ fontWeight: 900, color: 'var(--index-text-heading)' }}>Passing Grade: {evaluationFields.pass_mark}%</label>
                            <input type="range" min="0" max="100" step="5" value={evaluationFields.pass_mark} onChange={e => setEvaluationFields({ ...evaluationFields, pass_mark: parseInt(e.target.value) })} style={{ width: '100%', marginTop: '1rem', accentColor: 'var(--index-primary-color)' }} />
                        </div>

                        {evaluationFields.questions.map((q, idx) => (
                            <div key={q.id} className="q-card">
                                <div className="q-header">
                                    <span>Question {idx + 1}</span>
                                    <button onClick={() => setEvaluationFields({ ...evaluationFields, questions: evaluationFields.questions.filter(x => x.id !== q.id) })} className="del-btn"><Trash2 size={16} /></button>
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

                <div style={{ display: 'flex', gap: '3rem', paddingTop: '3rem', borderTop: '2.5px solid var(--index-border-subtle)' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1.1rem' }}>Preview Access</label>
                        <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>Allow students to view this lesson before enrolling.</p>
                        <input type="checkbox" checked={formData.preview_enabled} onChange={e => handleFieldChange('preview_enabled', e.target.checked)} style={{ marginTop: '12px', width: '24px', height: '24px', accentColor: 'var(--index-primary-color)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 900, color: 'var(--index-text-heading)', fontSize: '1.1rem' }}>Lock Lesson</label>
                        <p style={{ color: 'var(--index-text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>Require completion of previous lessons.</p>
                        <input type="checkbox" checked={formData.is_locked} onChange={e => handleFieldChange('is_locked', e.target.checked)} style={{ marginTop: '12px', width: '24px', height: '24px', accentColor: 'var(--index-primary-color)' }} />
                    </div>
                </div>
            </div>

            <footer style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end', gap: '2rem', background: 'var(--index-card-bg)', padding: '2.5rem 0', borderTop: '2px solid var(--index-border-subtle)', position: 'sticky', bottom: 0 }}>
                <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--index-text-faint)', fontWeight: 900, cursor: 'pointer', fontSize: '1.1rem' }}>Cancel</button>
                <button className="deploy-btn-forest" onClick={handleSubmit}>Save to Module</button>
            </footer>
        </div>
    );
}
