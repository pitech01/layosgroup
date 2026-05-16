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
    ChevronDown,
    Sparkles,
    Zap,
    Target,
    Layers,
    BookOpen,
    ArrowRight,
    Save,
    Share2
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
    const [deliveryMode, setDeliveryMode] = useState('Planning Phase');

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
                { id: 'm1', title: 'Unit 1: Foundational Frameworks', order_position: 1, isOpen: true, sessions: [] }
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
            else if (types.has('live')) setDeliveryMode('Synchronous Live');
            else if (types.has('video')) setDeliveryMode('Asynchronous Self-paced');
            else if (allSessions.length > 0) setDeliveryMode('Resource Catalog');
            else setDeliveryMode('Architecture Draft');
        }
    }, [modules]);

    const handleAddModule = () => {
        setModules([...modules, {
            id: `mod_${Date.now()}`,
            title: 'New Instructional Module',
            order_position: modules.length + 1,
            isOpen: true,
            sessions: []
        }]);
    };

    const handleEditModuleTitle = (modId: string, newTitle: string) => {
        setModules(modules.map(m => m.id === modId ? { ...m, title: newTitle } : m));
    };

    const handleDeleteModule = (modId: string) => {
        if (window.confirm('Are you sure you want to redact this module? All internal assets will be permanently removed.')) {
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
                        title: sessionData.title || 'Untitled Asset',
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
        <div className="min-h-screen bg-brand-beige/20 dark:bg-brand-charcoal text-brand-charcoal dark:text-white pb-32">
            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-[100] bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-2xl border-b border-brand-border px-6 py-4 md:px-12 flex justify-between items-center shadow-2xl shadow-brand-charcoal/5">
                <div className="flex items-center gap-6">
                    <Link to="/instructor/courses" className="w-12 h-12 bg-brand-beige dark:bg-white/5 text-brand-muted hover:text-brand-emerald border border-brand-border rounded-2xl flex items-center justify-center transition-all active:scale-90 no-underline group shadow-sm">
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg md:text-xl font-black uppercase tracking-tight line-clamp-1">{courseInfo.title}</h1>
                            <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Target size={12} /> {deliveryMode}
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${saveStatus === 'saving' ? 'text-brand-emerald animate-pulse' : 'text-brand-muted'}`}>
                            {saveStatus === 'saving' ? <><Clock size={12} /> Synchronizing Architecture...</> : <><Check size={12} /> Local Cloud Sync Active</>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="hidden md:flex h-12 px-6 bg-white dark:bg-white/10 border border-brand-border rounded-xl font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all items-center gap-2 border-none cursor-pointer">
                        <Eye size={18} /> Preview Canvas
                    </button>
                    <button className="h-12 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer">
                        Release Artifact
                    </button>
                </div>
            </header>

            {/* Main Canvas Area */}
            <main className="max-w-5xl mx-auto px-6 md:px-0 py-16 md:py-24 space-y-16 animate-fade-in-up">
                {/* Introduction Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Layers className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Curriculum Engineering</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">Architect the <span className="text-brand-emerald">Learning Journey</span></h2>
                    <p className="text-brand-muted font-medium text-lg md:text-xl max-w-3xl leading-relaxed">
                        Design an immersive educational ecosystem. Sequence your instructional assets, configure prerequisite gates, and manage interactive evaluation points.
                    </p>
                </div>

                {/* Modules Hierarchy */}
                <div className="space-y-10">
                    {modules.map((mod, idx) => (
                        <div key={mod.id} className={`group bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden transition-all duration-500 ${mod.isOpen ? 'shadow-2xl shadow-brand-charcoal/5 ring-1 ring-brand-emerald/20' : 'shadow-sm opacity-80 hover:opacity-100'}`}>
                            {/* Module Header */}
                            <div 
                                className="flex items-center gap-6 p-8 md:p-10 cursor-pointer select-none"
                                onClick={() => toggleModule(mod.id)}
                            >
                                <div className="w-12 h-12 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center text-brand-muted shrink-0 group-hover:text-brand-emerald transition-colors">
                                    <GripVertical size={24} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight focus:outline-none focus:text-brand-emerald transition-colors cursor-text"
                                        value={mod.title}
                                        onChange={(e) => handleEditModuleTitle(mod.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Module Identifier..."
                                    />
                                    <div className="flex items-center gap-3 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                                        <BookOpen size={14} className="text-brand-emerald" /> {mod.sessions.length} Instructional Assets Synchronized
                                    </div>
                                </div>
                                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => handleDeleteModule(mod.id)} 
                                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className={`w-10 h-10 flex items-center justify-center bg-brand-beige dark:bg-white/5 border border-brand-border rounded-xl text-brand-muted transition-transform duration-500 ${mod.isOpen ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Module Content */}
                            {mod.isOpen && (
                                <div className="px-8 md:px-10 pb-10 space-y-6 animate-fade-in-up">
                                    <div className="border-t border-brand-border pt-10 grid grid-cols-1 gap-4">
                                        {mod.sessions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-6 bg-brand-beige/20 dark:bg-white/5 rounded-[32px] border border-brand-border border-dashed text-center">
                                                <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-muted/30">
                                                    <Sparkles size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Empty Artifact Container</h4>
                                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">No assets detected within this instructional block.</p>
                                                </div>
                                            </div>
                                        ) : mod.sessions.map((sess) => (
                                            <div key={sess.id} className="group/item flex flex-col md:flex-row items-center justify-between p-6 bg-white dark:bg-brand-charcoal border border-brand-border rounded-[28px] hover:shadow-xl hover:shadow-brand-charcoal/5 hover:border-brand-emerald/50 transition-all duration-300">
                                                <div className="flex items-center gap-6 mb-6 md:mb-0 w-full md:w-auto">
                                                    <div className={`
                                                        w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform duration-500
                                                        ${sess.type === 'video' ? 'bg-blue-500/10 text-blue-600' : 
                                                          sess.type === 'live' ? 'bg-red-500/10 text-red-600' : 
                                                          sess.type === 'docs' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}
                                                    `}>
                                                        {sess.type === 'video' && <Video size={24} />}
                                                        {sess.type === 'live' && <Activity size={24} />}
                                                        {sess.type === 'docs' && <FileText size={24} />}
                                                        {sess.type === 'evaluation' && <HelpCircle size={24} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight line-clamp-1">{sess.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                                            <span className="text-brand-emerald">{sess.type === 'evaluation' ? 'Final Evaluation' : sess.type}</span>
                                                            <span className="w-1 h-1 bg-brand-muted/30 rounded-full"></span>
                                                            <span>{sess.is_locked ? 'Sequence Required' : 'Public Manifest'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                    <button 
                                                        onClick={() => handleOpenEditSession(mod.id, sess)} 
                                                        className="h-11 px-5 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer"
                                                    >
                                                        <Edit2 size={16} /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteSession(mod.id, sess.id)} 
                                                        className="h-11 w-11 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button 
                                            onClick={() => handleOpenAddSession(mod.id)} 
                                            className="mt-6 flex flex-col items-center justify-center py-8 gap-3 bg-brand-beige/10 dark:bg-white/5 border-2 border-brand-border border-dashed rounded-[32px] text-brand-muted hover:text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all duration-300 group/add border-none cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm group-hover/add:scale-110 transition-transform">
                                                <PlusCircle size={24} />
                                            </div>
                                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Initiate New Asset Deployment</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <button 
                        className="w-full flex flex-col items-center justify-center py-20 gap-8 bg-white dark:bg-brand-charcoal border-4 border-brand-border border-dashed rounded-[60px] text-brand-muted hover:text-brand-emerald hover:border-brand-emerald/50 hover:bg-brand-emerald/5 hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500 group/module-add border-none cursor-pointer" 
                        onClick={handleAddModule}
                    >
                        <div className="w-24 h-24 bg-brand-beige dark:bg-white/10 rounded-[32px] flex items-center justify-center shadow-lg group-hover/module-add:scale-110 transition-transform duration-500">
                            <Layout size={48} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Expand Curriculum</h3>
                            <p className="font-black text-xs uppercase tracking-[0.3em]">Initialize Sequential Module Protocol</p>
                        </div>
                    </button>
                </div>
            </main>

            {/* Premium Modal System */}
            {activeModal.isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-2xl animate-fade-in" onClick={() => setActiveModal({ ...activeModal, isOpen: false })}></div>
                    <div className="relative w-full max-w-6xl max-h-full bg-white dark:bg-brand-charcoal rounded-[60px] shadow-2xl overflow-y-auto custom-scrollbar animate-scale-up border border-white/10">
                        <button 
                            className="absolute top-10 right-10 w-16 h-16 bg-brand-beige dark:bg-white/5 text-brand-muted hover:text-red-500 rounded-full flex items-center justify-center transition-all border-none cursor-pointer z-50 shadow-sm" 
                            onClick={() => setActiveModal({ ...activeModal, isOpen: false })}
                        >
                            <X size={32} />
                        </button>

                        {!activeModal.type ? (
                            <div className="p-16 md:p-32 space-y-20">
                                <div className="text-center space-y-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                                            <Zap className="text-brand-emerald" size={24} />
                                        </div>
                                        <span className="text-brand-emerald font-black text-sm uppercase tracking-widest">Asset Classification</span>
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase">Select Asset <span className="text-brand-emerald">Type</span></h3>
                                    <p className="text-brand-muted font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Choose the specific instructional modality for this curriculum unit. Each type offers specialized delivery protocols.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div 
                                        className="group/opt p-12 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[48px] text-left cursor-pointer hover:border-brand-emerald hover:bg-brand-emerald/5 hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500" 
                                        onClick={() => setActiveModal({ ...activeModal, type: 'video' })}
                                    >
                                        <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm group-hover/opt:scale-110 transition-transform">
                                            <Video size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-brand-charcoal dark:text-white mt-10 mb-4 uppercase tracking-tight">Kinetic Artifact</h4>
                                        <p className="text-brand-muted font-medium leading-relaxed">Serialized video content and screen-capture recordings for asynchronous consumption.</p>
                                    </div>
                                    <div 
                                        className="group/opt p-12 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[48px] text-left cursor-pointer hover:border-brand-emerald hover:bg-brand-emerald/5 hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500" 
                                        onClick={() => setActiveModal({ ...activeModal, type: 'live' })}
                                    >
                                        <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-3xl flex items-center justify-center shadow-sm group-hover/opt:scale-110 transition-transform">
                                            <Activity size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-brand-charcoal dark:text-white mt-10 mb-4 uppercase tracking-tight">Synchronous Event</h4>
                                        <p className="text-brand-muted font-medium leading-relaxed">Real-time instructional sessions, interactive workshops, and live broadcast protocols.</p>
                                    </div>
                                    <div 
                                        className="group/opt p-12 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[48px] text-left cursor-pointer hover:border-brand-emerald hover:bg-brand-emerald/5 hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500" 
                                        onClick={() => setActiveModal({ ...activeModal, type: 'docs' })}
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center shadow-sm group-hover/opt:scale-110 transition-transform">
                                            <FileText size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-brand-charcoal dark:text-white mt-10 mb-4 uppercase tracking-tight">Textual Repository</h4>
                                        <p className="text-brand-muted font-medium leading-relaxed">Digital blueprints, PDF resources, and technical documentation for offline analysis.</p>
                                    </div>
                                    <div 
                                        className="group/opt p-12 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[48px] text-left cursor-pointer hover:border-brand-emerald hover:bg-brand-emerald/5 hover:shadow-2xl hover:shadow-brand-emerald/10 transition-all duration-500" 
                                        onClick={() => setActiveModal({ ...activeModal, type: 'evaluation' })}
                                    >
                                        <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-3xl flex items-center justify-center shadow-sm group-hover/opt:scale-110 transition-transform">
                                            <HelpCircle size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-brand-charcoal dark:text-white mt-10 mb-4 uppercase tracking-tight">Cognitive Assessment</h4>
                                        <p className="text-brand-muted font-medium leading-relaxed">Advanced quizzes and validation checkpoints to measure curriculum comprehension.</p>
                                    </div>
                                </div>
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
        <div className="p-16 md:p-24 space-y-16 animate-fade-in-up">
            <header className="flex flex-col md:flex-row items-center gap-10">
                <div className={`
                    w-24 h-24 rounded-[32px] flex items-center justify-center shadow-lg shrink-0
                    ${type === 'video' ? 'bg-blue-500/10 text-blue-600' : 
                      type === 'live' ? 'bg-red-500/10 text-red-600' : 
                      type === 'docs' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}
                `}>
                    {type === 'video' && <Video size={40} />}
                    {type === 'live' && <Activity size={40} />}
                    {type === 'docs' && <FileText size={40} />}
                    {type === 'evaluation' && <HelpCircle size={40} />}
                </div>
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">
                        {initialData ? 'Update Artifact' : `Deploy ${type === 'docs' ? 'Resource' : (type === 'evaluation' ? 'Evaluation' : type)}`}
                    </h2>
                    <p className="text-brand-muted font-medium text-lg md:text-xl">Configure the technical metadata and content parameters for this unit.</p>
                </div>
            </header>

            <div className="space-y-12">
                <div className="grid grid-cols-1 gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Instructional Asset Title</label>
                        <input 
                            className="w-full h-16 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold text-xl" 
                            value={formData.title} 
                            onChange={e => handleFieldChange('title', e.target.value)} 
                            placeholder="e.g. Fundamental Systems Architecture" 
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Content Narrative & Objectives</label>
                        <textarea 
                            className="w-full p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold text-lg min-h-[160px] resize-none" 
                            value={formData.description} 
                            onChange={e => handleFieldChange('description', e.target.value)} 
                            placeholder="Articulate the core concepts and learning outcomes for this session..." 
                        />
                    </div>
                </div>

                {type === 'video' && (
                    <div className="flex flex-col items-center justify-center p-16 bg-brand-emerald/5 border-2 border-brand-emerald/20 border-dashed rounded-[48px] text-center gap-6 group hover:bg-brand-emerald/10 transition-colors">
                        <div className="w-20 h-20 bg-brand-emerald/10 text-brand-emerald rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <UploadCloud size={48} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Initiate Artifact Upload</h4>
                            <p className="text-brand-muted font-medium">Synchronize MP4, MOV, or external VOD endpoints.</p>
                        </div>
                    </div>
                )}

                {type === 'live' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Transmission Platform</label>
                            <select className="w-full h-14 px-6 bg-white dark:bg-brand-charcoal/50 border-2 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white cursor-pointer">
                                <option>Microsoft Teams Ecosystem</option>
                                <option>Zoom Enterprise Protocol</option>
                                <option>Google Meet Endpoint</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Meeting Access Link</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                    <Share2 size={18} />
                                </div>
                                <input className="w-full h-14 pl-14 pr-6 bg-white dark:bg-brand-charcoal/50 border-2 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white" placeholder="https://synchronization.link/..." />
                            </div>
                        </div>
                    </div>
                )}

                {type === 'evaluation' && (
                    <div className="space-y-10">
                        <div className="p-10 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border space-y-6">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em]">Minimum Proficiency Benchmark: <span className="text-brand-emerald text-lg ml-2">{evaluationFields.pass_mark}%</span></label>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="5" 
                                value={evaluationFields.pass_mark} 
                                onChange={e => setEvaluationFields({ ...evaluationFields, pass_mark: parseInt(e.target.value) })} 
                                className="w-full h-3 bg-brand-border rounded-full appearance-none cursor-pointer accent-brand-emerald" 
                            />
                        </div>

                        <div className="space-y-6">
                            {evaluationFields.questions.map((q, idx) => (
                                <div key={q.id} className="p-10 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-xl shadow-sm space-y-8 relative group/q">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl flex items-center justify-center font-black text-xs">
                                                {idx + 1}
                                            </div>
                                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Validation Checkpoint</span>
                                        </div>
                                        <button 
                                            onClick={() => setEvaluationFields({ ...evaluationFields, questions: evaluationFields.questions.filter(x => x.id !== q.id) })} 
                                            className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <input 
                                        className="w-full h-14 px-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white text-lg" 
                                        value={q.text} 
                                        onChange={e => updateQuestion(q.id, { text: e.target.value })} 
                                        placeholder="Formulate the validation question..." 
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${q.correctIndex === oIdx ? 'bg-brand-emerald/10 border-brand-emerald' : 'bg-brand-beige/20 dark:bg-white/5 border-brand-border'}`}>
                                                <input 
                                                    type="radio" 
                                                    checked={q.correctIndex === oIdx} 
                                                    onChange={() => updateQuestion(q.id, { correctIndex: oIdx })} 
                                                    className="w-5 h-5 accent-brand-emerald cursor-pointer"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={opt} 
                                                    onChange={e => {
                                                        const newOpts = [...q.options];
                                                        newOpts[oIdx] = e.target.value;
                                                        updateQuestion(q.id, { options: newOpts });
                                                    }} 
                                                    className="bg-transparent border-none focus:outline-none font-bold text-brand-charcoal dark:text-white flex-1"
                                                    placeholder={`Hypothesis ${oIdx + 1}`} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button 
                                className="w-full h-20 flex items-center justify-center gap-4 bg-brand-beige dark:bg-white/5 border-2 border-brand-border border-dashed rounded-[32px] text-brand-muted hover:text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all font-black text-xs uppercase tracking-widest border-none cursor-pointer" 
                                onClick={addQuestion}
                            >
                                <PlusCircle size={20} /> Extend Validation Matrix
                            </button>
                        </div>
                    </div>
                )}

                {/* Global Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-16 border-t border-brand-border">
                    <div className="p-10 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-brand-emerald shadow-sm">
                                <Sparkles size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Preview Authorization</h4>
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Allow unsolicited artifact analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-brand-charcoal border border-brand-border rounded-2xl">
                            <input 
                                type="checkbox" 
                                checked={formData.preview_enabled} 
                                onChange={e => handleFieldChange('preview_enabled', e.target.checked)} 
                                className="w-6 h-6 accent-brand-emerald cursor-pointer"
                            />
                            <span className="font-bold text-sm text-brand-charcoal dark:text-white">Enable Open Access Manifest</span>
                        </div>
                    </div>
                    <div className="p-10 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                                <Lock size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Sequence Protocol</h4>
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Enforce strict prerequisite gates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-brand-charcoal border border-brand-border rounded-2xl">
                            <input 
                                type="checkbox" 
                                checked={formData.is_locked} 
                                onChange={e => handleFieldChange('is_locked', e.target.checked)} 
                                className="w-6 h-6 accent-brand-emerald cursor-pointer"
                            />
                            <span className="font-bold text-sm text-brand-charcoal dark:text-white">Activate Decryption Locks</span>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="pt-20 flex flex-col md:flex-row justify-end gap-6 border-t border-brand-border bg-white dark:bg-brand-charcoal -mx-16 md:-mx-24 px-16 md:px-24 pb-12 sticky bottom-0 z-50">
                <button 
                    onClick={onCancel} 
                    className="h-16 px-10 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-none cursor-pointer"
                >
                    Abort Changes
                </button>
                <button 
                    className="h-16 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-none cursor-pointer" 
                    onClick={handleSubmit}
                >
                    <Save size={20} /> Commit to Module Repository
                </button>
            </footer>
        </div>
    );
}
