import { useState, useEffect } from 'react';
import {
    ChevronRight,
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
    Download,
    PlusCircle,
    Check
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
    const [deliveryMode, setDeliveryMode] = useState('Drafting');

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
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1000));
            localStorage.setItem(`course_${courseId}_curriculum`, JSON.stringify(data));
            setSaveStatus('saved');
        },
        loadCurriculum: () => {
            const saved = localStorage.getItem(`course_${courseId}_curriculum`);
            return saved ? JSON.parse(saved) : [
                { id: 'm1', title: 'Phase 1: Brand Strategy', order_position: 1, isOpen: true, sessions: [] }
            ];
        }
    };

    // --- INITIAL LOAD ---
    useEffect(() => {
        const data = api.loadCurriculum();
        setModules(data);
    }, [courseId]);

    // --- AUTO-SAVE & AUTO-DETECTION ---
    useEffect(() => {
        if (modules.length > 0) {
            api.saveCurriculum(modules);

            // Auto-detect delivery mode
            const allSessions = modules.flatMap(m => m.sessions);
            const types = new Set(allSessions.map(s => s.type));
            if (types.has('live') && types.has('video')) setDeliveryMode('Hybrid Delivery');
            else if (types.has('live')) setDeliveryMode('Live Interactive');
            else if (types.has('video')) setDeliveryMode('On-Demand');
            else if (allSessions.length > 0) setDeliveryMode('Document Hub');
            else setDeliveryMode('Empty Framework');
        }
    }, [modules]);

    // --- MODULE HANDLERS ---
    const handleAddModule = () => {
        const newModule: Module = {
            id: `mod_${Date.now()}`,
            title: 'Uncharted Module',
            order_position: modules.length + 1,
            isOpen: true,
            sessions: []
        };
        setModules([...modules, newModule]);
    };

    const handleEditModuleTitle = (modId: string, newTitle: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, title: newTitle } : m));
    };

    const handleDeleteModule = (modId: string) => {
        if (window.confirm('WARNING: Deleting this module will permanently remove all associated sessions. Proceed?')) {
            setModules(modules.filter(m => m.id !== modId));
        }
    };

    const toggleModule = (modId: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, isOpen: !m.isOpen } : m));
    };

    // --- SESSION HANDLERS ---
    const handleOpenAddSession = (modId: string) => {
        setActiveModal({ isOpen: true, type: null, moduleId: modId, sessionToEdit: null });
    };

    const handleOpenEditSession = (modId: string, session: Session) => {
        setActiveModal({ isOpen: true, type: session.type, moduleId: modId, sessionToEdit: session });
    };

    const handleDeleteSession = (modId: string, sessId: string) => {
        if (window.confirm('Remove this session from the curriculum?')) {
            setModules(modules.map(m => {
                if (m.id === modId) {
                    return { ...m, sessions: m.sessions.filter(s => s.id !== sessId) };
                }
                return m;
            }));
        }
    };

    const handleSaveSession = (sessionData: Partial<Session>) => {
        const { moduleId, sessionToEdit, type } = activeModal;
        if (!moduleId) return;

        setModules(modules.map(m => {
            if (m.id === moduleId) {
                if (sessionToEdit) {
                    // Update existing
                    return {
                        ...m,
                        sessions: m.sessions.map(s => s.id === sessionToEdit.id ? { ...s, ...sessionData } as Session : s)
                    };
                } else {
                    // Create new
                    const newSession: Session = {
                        id: `sess_${Date.now()}`,
                        module_id: moduleId,
                        title: sessionData.title || 'Untitled Session',
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
            {/* Top Navigation / Dashboard Header */}
            <header className="curriculum-header">
                <div className="header-brand">
                    <Link to="/instructor/courses" className="exit-btn"><ChevronLeft /></Link>
                    <div className="header-info">
                        <div className="header-title-row">
                            <h1>{courseInfo.title}</h1>
                            <span className="badge-delivery">
                                <Activity size={12} /> {deliveryMode}
                            </span>
                        </div>
                        <div className={`save-status ${saveStatus}`}>
                            {saveStatus === 'saving' ? <><Clock size={12} /> Saving changes...</> : <><Check size={12} /> All changes saved</>}
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary"><Eye size={18} /> Preview</button>
                    <button className="btn-primary">Publish to Marketplace</button>
                </div>
            </header>

            <main className="curriculum-canvas">
                <div className="canvas-header">
                    <h2>Curriculum Architecture</h2>
                    <p>Design your learning path. Add modules and populate them with specialized sessions.</p>
                </div>

                <div className="modules-list">
                    {modules.map((mod) => (
                        <div key={mod.id} className={`module-box ${mod.isOpen ? 'expanded' : 'collapsed'}`}>
                            <div className="module-top" onClick={() => toggleModule(mod.id)}>
                                <div className="drag-handle"><GripVertical size={20} /></div>
                                <div className="module-title-zone">
                                    <input
                                        className="module-title-input"
                                        value={mod.title}
                                        onChange={(e) => handleEditModuleTitle(mod.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Module Title..."
                                    />
                                    <span className="module-meta">{mod.sessions.length} Sessions Defined</span>
                                </div>
                                <div className="module-controls" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="ctrl-btn delete"><Trash2 size={18} /></button>
                                    <div className="chevron-toggle"><ChevronDown size={20} isOpen={mod.isOpen} /></div>
                                </div>
                            </div>

                            {mod.isOpen && (
                                <div className="module-body">
                                    <div className="sessions-container">
                                        {mod.sessions.length === 0 && (
                                            <div className="empty-placeholder">No nodes deployed to this module yet.</div>
                                        )}
                                        {mod.sessions.map((sess) => (
                                            <div key={sess.id} className="session-item">
                                                <div className="session-left">
                                                    <div className={`session-icon ${sess.type}`}>
                                                        {sess.type === 'video' && <Video size={18} />}
                                                        {sess.type === 'live' && <Activity size={18} />}
                                                        {sess.type === 'docs' && <FileText size={18} />}
                                                        {sess.type === 'assessment' && <HelpCircle size={18} />}
                                                    </div>
                                                    <div className="session-text">
                                                        <h4>{sess.title}</h4>
                                                        <p>{sess.type.toUpperCase()} • {sess.is_locked ? 'Locked' : 'Open for Preview'}</p>
                                                    </div>
                                                </div>
                                                <div className="session-right">
                                                    <button onClick={() => handleOpenEditSession(mod.id, sess)} className="ctrl-btn edit"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteSession(mod.id, sess.id)} className="ctrl-btn delete"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleOpenAddSession(mod.id)} className="add-session-trigger">
                                        <PlusCircle size={20} />
                                        <span>Deploy New Session Unit</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button className="add-module-master" onClick={handleAddModule}>
                        <Layout size={24} />
                        Architect New Module
                    </button>
                </div>
            </main>

            {/* --- MASTER MODAL SYSTEM --- */}
            {activeModal.isOpen && (
                <div className="modal-overlay" onClick={() => setActiveModal({ ...activeModal, isOpen: false })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {!activeModal.type ? (
                            <div className="session-selector">
                                <h3>Select Session Architecture</h3>
                                <p>Which payload should this session deliver to students?</p>
                                <div className="selector-grid">
                                    <div className="select-opt video" onClick={() => setActiveModal({ ...activeModal, type: 'video' })}>
                                        <div className="opt-icon"><Video size={32} /></div>
                                        <h4>Masterclass Video</h4>
                                        <p>Cinema-grade 4K or linked assets.</p>
                                    </div>
                                    <div className="select-opt live" onClick={() => setActiveModal({ ...activeModal, type: 'live' })}>
                                        <div className="opt-icon"><Activity size={32} /></div>
                                        <h4>Live Intervention</h4>
                                        <p>Real-time high intensity training.</p>
                                    </div>
                                    <div className="select-opt docs" onClick={() => setActiveModal({ ...activeModal, type: 'docs' })}>
                                        <div className="opt-icon"><FileText size={32} /></div>
                                        <h4>Resource Asset</h4>
                                        <p>PDFs, Doc Blueprints, Slides.</p>
                                    </div>
                                    <div className="select-opt assessment" onClick={() => setActiveModal({ ...activeModal, type: 'assessment' })}>
                                        <div className="opt-icon"><HelpCircle size={32} /></div>
                                        <h4>Logic Assessment</h4>
                                        <p>Knowledge validation & scoring.</p>
                                    </div>
                                </div>
                                <button className="modal-close" onClick={() => setActiveModal({ ...activeModal, isOpen: false })}><X /></button>
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

            <style>{`
                .curriculum-container { min-height: 100vh; background: #f8fafc; color: #1e293b; }
                .curriculum-header { background: white; padding: 1rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; sticky top: 0; z-index: 100; }
                .header-brand { display: flex; align-items: center; gap: 1.5rem; }
                .exit-btn { width: 40px; height: 40px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; }
                .header-title-row { display: flex; align-items: center; gap: 12px; }
                .header-title-row h1 { font-size: 1.25rem; font-weight: 900; margin: 0; }
                .badge-delivery { background: rgba(2, 6, 23, 0.08); color: #020617; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
                .save-status { font-size: 0.75rem; font-weight: 700; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
                .save-status.saving { color: #2563eb; }
                .header-actions { display: flex; gap: 1rem; }
                
                .btn-primary { background: #020617; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 850; cursor: pointer; }
                .btn-secondary { background: white; color: #475569; border: 2px solid #e2e8f0; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }

                .curriculum-canvas { max-width: 900px; margin: 4rem auto; padding: 0 2rem; }
                .canvas-header { margin-bottom: 3rem; }
                .canvas-header h2 { font-size: 2rem; font-weight: 950; margin-bottom: 0.5rem; }
                .canvas-header p { color: #64748b; font-weight: 600; }

                .modules-list { display: flex; flex-direction: column; gap: 2rem; }
                .module-box { background: white; border-radius: 24px; border: 2px solid #e2e8f0; overflow: hidden; transition: all 0.3s; }
                .module-box.expanded { border-color: rgba(2, 6, 23, 0.2); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
                
                .module-top { padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1.5rem; cursor: pointer; background: #fcfdfe; }
                .drag-handle { color: #cbd5e1; }
                .module-title-zone { flex: 1; display: flex; flex-direction: column; }
                .module-title-input { font-size: 1.1rem; font-weight: 900; border: none; background: transparent; padding: 4px 0; outline: none; transition: all 0.2s; border-bottom: 2px solid transparent; }
                .module-title-input:focus { border-bottom-color: #020617; }
                .module-meta { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .module-controls { display: flex; align-items: center; gap: 1rem; }
                .ctrl-btn { border: none; background: transparent; padding: 8px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
                .ctrl-btn.delete:hover { background: #fef2f2; color: #dc2626; }
                .ctrl-btn.edit:hover { background: #eff6ff; color: #2563eb; }
                
                .module-body { padding: 0 2rem 2rem 2rem; border-top: 2px solid #f1f5f9; background: white; }
                .sessions-container { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem 0; }
                .empty-placeholder { color: #94a3b8; font-style: italic; font-size: 0.9rem; text-align: center; padding: 2rem; border: 2px dashed #f1f5f9; border-radius: 16px; }
                
                .session-item { background: #f8fafc90; border: 2px solid #f1f5f9; padding: 1rem 1.5rem; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
                .session-item:hover { transform: translateX(4px); border-color: rgba(2, 6, 23, 0.25); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                .session-left { display: flex; align-items: center; gap: 1.25rem; }
                .session-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .session-icon.video { background: #eff6ff; color: #2563eb; }
                .session-icon.live { background: #fef2f2; color: #dc2626; }
                .session-icon.docs { background: #f0fdf4; color: #10b981; }
                .session-icon.assessment { background: #fefce8; color: #ca8a04; }
                .session-text h4 { font-size: 0.95rem; font-weight: 850; margin: 0; }
                .session-text p { font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin: 2px 0 0 0; }
                .session-right { display: flex; gap: 4px; }

                .add-session-trigger { width: 100%; padding: 1.25rem; border-radius: 18px; border: 2px dashed #cbd5e1; background: transparent; color: #64748b; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.3s; }
                .add-session-trigger:hover { background: rgba(2, 6, 23, 0.04); border-color: rgba(2, 6, 23, 0.25); color: #020617; }
                
                .add-module-master { width: 100%; padding: 2rem; border-radius: 32px; border: 3px dashed rgba(2, 6, 23, 0.15); background: white; color: #020617; font-size: 1.15rem; font-weight: 950; display: flex; align-items: center; justify-content: center; gap: 16px; cursor: pointer; transition: all 0.3s; margin-top: 2rem; }
                .add-module-master:hover { background: rgba(2, 6, 23, 0.03); border-color: rgba(2, 6, 23, 0.25); transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); }

                /* MODAL */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .modal-content { background: white; border-radius: 40px; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.3); }
                .session-selector { padding: 4rem; text-align: center; }
                .session-selector h3 { font-size: 2rem; font-weight: 950; margin-bottom: 1rem; }
                .selector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 3rem; }
                .select-opt { padding: 2.5rem; border: 2px solid #f1f5f9; border-radius: 32px; text-align: left; cursor: pointer; transition: all 0.3s; }
                .select-opt:hover { border-color: #020617; background: rgba(2, 6, 23, 0.03); transform: scale(1.02); }
                .opt-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
                .video .opt-icon { background: #eff6ff; color: #2563eb; }
                .live .opt-icon { background: #fef2f2; color: #dc2626; }
                .docs .opt-icon { background: #f0fdf4; color: #10b981; }
                .assessment .opt-icon { background: #fefce8; color: #ca8a04; }
                .modal-close { position: absolute; top: 2rem; right: 2rem; border: none; background: #f1f5f9; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; }
            `}</style>
        </div>
    );
}

// --- CHEVRON DOWN COMPONENT ---
function ChevronDown({ size, isOpen }: { size: number, isOpen: boolean }) {
    return <ChevronRight size={size} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />;
}

// --- SESSION FORM COMPONENT ---
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
        const newQ: QuizQuestion = {
            id: `q_${Date.now()}`,
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0
        };
        setAssessmentFields({ ...assessmentFields, questions: [...assessmentFields.questions, newQ] });
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
                    {type === 'video' && <Video />}
                    {type === 'live' && <Activity />}
                    {type === 'docs' && <FileText />}
                    {type === 'assessment' && <HelpCircle />}
                </div>
                <div>
                    <h2>{initialData ? 'Update Curriculum Node' : `Deploy New ${type.charAt(0).toUpperCase() + type.slice(1)} Session`}</h2>
                    <p>Architecture settings for "{type}" payload.</p>
                </div>
            </header>

            <div className="form-body">
                <div className="form-group full">
                    <label>Session Title</label>
                    <input
                        className="form-input-text"
                        value={formData.title}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        placeholder="e.g. Fundamental Logic of Architecture"
                    />
                </div>

                <div className="form-group full">
                    <label>Brief Protocol Description</label>
                    <textarea
                        className="form-textarea"
                        value={formData.description}
                        onChange={e => handleFieldChange('description', e.target.value)}
                        placeholder="Explain the learning objectives of this unit..."
                    />
                </div>

                {/* --- VIDEO FIELDS --- */}
                {type === 'video' && (
                    <div className="special-fields">
                        <div className="upload-box">
                            <UploadCloud size={40} />
                            <h4>Drop Master Video Here</h4>
                            <p>MP4, MOV, or internal source link.</p>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Estimated Runtime (Min)</label>
                                <input className="form-input-text" value={formData.duration} onChange={e => handleFieldChange('duration', e.target.value)} placeholder="00:00" />
                            </div>
                            <div className="form-group">
                                <label>Asset Policy</label>
                                <select className="form-input-text">
                                    <option>Internal Protected Source</option>
                                    <option>Vimeo High-Security</option>
                                    <option>YouTube Private</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LIVE FIELDS --- */}
                {type === 'live' && (
                    <div className="special-fields">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Deployment Date</label>
                                <input type="date" className="form-input-text" value={formData.start_time?.split('T')[0]} onChange={e => handleFieldChange('start_time', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Platform Backbone</label>
                                <select className="form-input-text" value={formData.platform} onChange={e => handleFieldChange('platform', e.target.value)}>
                                    <option>Zoom Communications</option>
                                    <option>Google Meet</option>
                                    <option>Layos Internal Stream</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group full">
                            <label>Secure Transport Bridge (Link)</label>
                            <input className="form-input-text" value={formData.meeting_link} onChange={e => handleFieldChange('meeting_link', e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                )}

                {/* --- DOCS FIELDS --- */}
                {type === 'docs' && (
                    <div className="special-fields">
                        <div className="upload-box asset">
                            <Download size={40} />
                            <h4>Knowledge Asset Deployment</h4>
                            <p>Select PDF, Slide Deck, or Strategic Document.</p>
                            <input type="file" className="hidden-input" />
                        </div>
                    </div>
                )}

                {/* --- ASSESSMENT FIELDS --- */}
                {type === 'assessment' && (
                    <div className="special-fields">
                        <div className="form-group full">
                            <label>Pass Mark Threshold (%)</label>
                            <input type="range" min="0" max="100" step="5" value={assessmentFields.pass_mark} onChange={e => setAssessmentFields({ ...assessmentFields, pass_mark: parseInt(e.target.value) })} />
                            <div className="range-label">{assessmentFields.pass_mark}% Required for Certification</div>
                        </div>

                        <div className="questions-builder">
                            <h3>Question Logic Engine ({assessmentFields.questions.length})</h3>
                            {assessmentFields.questions.map((q, qIdx) => (
                                <div key={q.id} className="q-card">
                                    <div className="q-header">
                                        <span>Q{qIdx + 1} Configuration</span>
                                        <button onClick={() => setAssessmentFields({ ...assessmentFields, questions: assessmentFields.questions.filter(x => x.id !== q.id) })} className="del-btn"><Trash2 size={16} /></button>
                                    </div>
                                    <input
                                        className="form-input-text"
                                        value={q.text}
                                        onChange={e => updateQuestion(q.id, { text: e.target.value })}
                                        placeholder="Formulate the inquisitive logic..."
                                    />
                                    <div className="options-grid">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`opt-row ${q.correctIndex === oIdx ? 'correct' : ''}`}>
                                                <input type="radio" checked={q.correctIndex === oIdx} onChange={() => updateQuestion(q.id, { correctIndex: oIdx })} />
                                                <input value={opt} onChange={e => {
                                                    const newOpts = [...q.options];
                                                    newOpts[oIdx] = e.target.value;
                                                    updateQuestion(q.id, { options: newOpts });
                                                }} placeholder={`Inference Node ${oIdx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button className="add-q-btn" onClick={addQuestion}><PlusCircle size={20} /> Add Inference Node</button>
                        </div>
                    </div>
                )}

                <div className="form-toggles">
                    <div className="toggle-item">
                        <label>Preview Protocol</label>
                        <p>Allow non-purchased access to this unit.</p>
                        <input type="checkbox" checked={formData.preview_enabled} onChange={e => handleFieldChange('preview_enabled', e.target.checked)} />
                    </div>
                    <div className="toggle-item">
                        <label>Security Lock</label>
                        <p>Lock unit behind prerequisite sessions.</p>
                        <input type="checkbox" checked={formData.is_locked} onChange={e => handleFieldChange('is_locked', e.target.checked)} />
                    </div>
                </div>
            </div>

            <footer className="form-footer">
                <button className="btn-cancel" onClick={onCancel}>Abort Operation</button>
                <button className="btn-deploy" onClick={handleSubmit}>Deploy To Curriculum</button>
            </footer>

            <style>{`
                .form-wrapper { padding: 4rem; }
                .form-header { display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; }
                .form-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
                .form-icon.video { background: #eff6ff; color: #2563eb; }
                .form-icon.live { background: #fef2f2; color: #dc2626; }
                .form-icon.docs { background: #f0fdf4; color: #10b981; }
                .form-icon.assessment { background: #fefce8; color: #ca8a04; }
                .form-header h2 { font-size: 1.75rem; font-weight: 950; margin: 0; }
                .form-header p { color: #64748b; font-weight: 700; margin-top: 4px; }

                .form-body { display: flex; flex-direction: column; gap: 2rem; }
                .form-group label { font-size: 0.8rem; font-weight: 850; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
                .form-input-text { width: 100%; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 0.85rem 1.25rem; font-size: 1rem; font-weight: 600; outline: none; transition: all 0.2s; }
                .form-input-text:focus { border-color: #020617; background: white; box-shadow: 0 0 0 4px rgba(2, 6, 23, 0.1); }
                .form-textarea { width: 100%; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 1.25rem; font-size: 1rem; font-weight: 600; outline: none; min-height: 120px; resize: none; }
                .form-textarea:focus { border-color: #020617; background: white; }

                .upload-box { padding: 3rem; border: 3px dashed rgba(2, 6, 23, 0.15); border-radius: 28px; text-align: center; margin-bottom: 1.5rem; background: #fcfdfe; }
                .upload-box h4 { font-size: 1.15rem; font-weight: 900; margin: 1rem 0 0.5rem 0; }
                .upload-box p { color: #94a3b8; font-size: 0.85rem; font-weight: 600; }
                .form-row { display: flex; gap: 1.5rem; }
                
                .range-label { text-align: center; font-weight: 900; font-size: 0.9rem; color: #020617; margin-top: 1rem; }
                .questions-builder { margin-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .q-card { background: #f8fafc; padding: 2rem; border-radius: 24px; border: 2px solid #e2e8f0; }
                .q-header { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 900; font-size: 0.85rem; color: #64748b; }
                .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
                .opt-row { display: flex; align-items: center; gap: 10px; background: white; padding: 8px 12px; border-radius: 12px; border: 2px solid transparent; }
                .opt-row.correct { border-color: #10b981; background: #f0fdf4; }
                .opt-row input[type="text"] { border: none; background: transparent; flex: 1; outline: none; font-weight: 600; font-size: 0.9rem; }
                .add-q-btn { width: 100%; padding: 1.25rem; border-radius: 16px; border: 2px dashed #cbd5e1; background: transparent; color: #64748b; font-weight: 850; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
                
                .form-toggles { display: flex; gap: 2rem; padding-top: 2rem; border-top: 2px solid #f1f5f9; }
                .toggle-item { flex: 1; position: relative; padding-right: 4rem; }
                .toggle-item label { font-weight: 900; display: block; }
                .toggle-item p { margin: 4px 0 0 0; font-size: 0.8rem; color: #64748b; font-weight: 600; line-height: 1.4; }
                .toggle-item input { position: absolute; right: 0; top: 0; width: 28px; height: 28px; accent-color: #020617; cursor: pointer; }

                .form-footer { margin-top: 4rem; display: flex; justify-content: flex-end; gap: 1.5rem; position: sticky; bottom: 0; background: white; padding: 2rem 0; border-top: 2px solid #f1f5f9; }
                .btn-cancel { background: transparent; border: none; color: #64748b; font-weight: 850; cursor: pointer; padding: 1rem 2rem; }
                .btn-deploy { background: #020617; color: white; border: none; border-radius: 18px; padding: 1.25rem 3.5rem; font-weight: 950; cursor: pointer; box-shadow: 0 10px 30px -10px rgba(2, 6, 23, 0.4); }
            `}</style>
        </div>
    );
}
