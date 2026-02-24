import { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Plus,
    Video,
    Users,
    FileText,
    Layout,
    Edit2,
    ChevronDown,
    HelpCircle,
    Trash2,
    GripVertical,
    CheckCircle2,
    Clock,
    Globe,
    Eye,
    UploadCloud,
    BookOpen,
    MoreVertical,
    Lock
} from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'live' | 'material' | 'quiz';
    duration?: string;
    description?: string;
    isLocked: boolean;
    isPreview: boolean;
    // Type specific fields
    videoUrl?: string;
    videoSource?: 'upload' | 'youtube' | 'vimeo';
    liveDate?: string;
    liveTime?: string;
    livePlatform?: string;
    liveLink?: string;
    fileName?: string;
    fileUrl?: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    isOpen: boolean;
}

export default function CreateCourse() {
    const [step, setStep] = useState(1);
    const [modules, setModules] = useState<Module[]>([
        {
            id: 'm1',
            title: 'Module 1: Getting Started',
            isOpen: true,
            lessons: [
                { id: 'l1', title: 'Welcome to the Course', type: 'video', isLocked: false, isPreview: true }
            ]
        }
    ]);

    // Category Management
    const [categories] = useState(['Design & Creative', 'Software Engineering', 'Business & Finance', 'Health & Wellness', 'Marketing']);

    // Editing State
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

    // Helpers
    const addModule = () => {
        const newModule: Module = {
            id: 'm' + Date.now(),
            title: `Module ${modules.length + 1}: Write Title Here`,
            lessons: [],
            isOpen: true
        };
        setModules([...modules, newModule]);
    };

    const addLesson = (moduleId: string, type: Lesson['type']) => {
        setModules(modules.map(mod => {
            if (mod.id === moduleId) {
                return {
                    ...mod,
                    lessons: [...mod.lessons, {
                        id: 'l' + Date.now(),
                        title: 'New ' + type,
                        type,
                        isLocked: false,
                        isPreview: false
                    }]
                };
            }
            return mod;
        }));
    };

    const toggleModule = (id: string) => {
        setModules(modules.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m));
    };

    const removeModule = (id: string) => {
        if (window.confirm('Are you sure you want to remove this module and all its contents?')) {
            setModules(modules.filter(m => m.id !== id));
        }
    };

    const updateModuleTitle = (id: string, title: string) => {
        setModules(modules.map(m => m.id === id ? { ...m, title } : m));
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        if (window.confirm('Delete this session?')) {
            setModules(modules.map(mod => {
                if (mod.id === moduleId) {
                    return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
                }
                return mod;
            }));
        }
    };

    const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
        setModules(modules.map(mod => {
            if (mod.id === moduleId) {
                return {
                    ...mod,
                    lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
                };
            }
            return mod;
        }));
    };

    const getDeliveryType = () => {
        const allLessons = modules.flatMap(m => m.lessons);
        if (allLessons.length === 0) return { label: 'Not Configured', color: '#94a3b8', icon: <Clock size={18} />, bg: '#f1f5f9' };

        const hasLive = allLessons.some(l => l.type === 'live');
        const hasVideo = allLessons.some(l => l.type === 'video');

        if (hasLive && hasVideo) return { label: 'Hybrid Learning', color: '#b45309', icon: <Globe size={18} />, bg: '#fff7ed' };
        if (hasLive) return { label: 'Live Training', color: '#b91c1c', icon: <Users size={18} />, bg: '#fef2f2' };
        return { label: 'Self-Paced Course', color: '#020617', icon: <Video size={18} />, bg: '#f0f9ff' };
    };

    const deliveryStatus = getDeliveryType();

    return (
        <div className="create-course-system">
            <style>{`
                .create-course-system {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding-bottom: 8rem;
                }

                .step-indicator-bar {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5rem;
                    position: relative;
                    padding: 0 1rem;
                }

                .step-indicator-bar::before {
                    content: '';
                    position: absolute;
                    top: 28px;
                    left: 2rem;
                    right: 2rem;
                    height: 4px;
                    background: #f1f5f9;
                    z-index: 1;
                    border-radius: 10px;
                }

                .step-item {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                    flex: 1;
                }

                .step-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    background: white;
                    border: 2.5px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #94a3b8;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .step-item.active .step-circle {
                    border-color: #020617;
                    background: linear-gradient(135deg, #020617, #0f172a);
                    color: white;
                    transform: scale(1.15) translateY(-4px);
                    box-shadow: 0 15px 25px -5px rgba(2, 6, 23, 0.25);
                }

                .step-item.completed .step-circle {
                    border-color: #020617;
                    background: #f0f9ff;
                    color: #020617;
                }

                .step-label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    transition: all 0.3s;
                }

                .step-item.active .step-label { 
                    color: #020617; 
                    transform: translateY(-2px);
                }

                .form-section-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.7);
                    border-radius: 32px;
                    padding: 4rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.03), 0 15px 20px -5px rgba(0,0,0,0.02);
                }

                .section-title {
                    margin: 0 0 3rem 0;
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    letter-spacing: -0.02em;
                }

                .custom-input {
                    width: 100%;
                    padding: 1.15rem 1.35rem;
                    border-radius: 18px;
                    border: 1.5px solid #e2e8f0;
                    outline: none;
                    font-size: 1rem;
                    color: #1f2937;
                    background: #fcfdfe;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .custom-input:focus {
                    border-color: #020617;
                    background: white;
                    box-shadow: 0 0 0 5px rgba(2, 6, 23, 0.06);
                    transform: translateY(-1px);
                }

                .input-label {
                    display: block;
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #475569;
                    margin-bottom: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .curriculum-module {
                    border: 1.5px solid #f1f5f9;
                    border-radius: 24px;
                    margin-bottom: 2.5rem;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .module-header {
                    padding: 1.5rem 2.5rem;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                    user-select: none;
                    transition: background 0.2s;
                }

                .module-header:hover { background: #f1f5f9; }

                .lesson-card {
                    padding: 1.5rem 2.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .lesson-card:hover {
                    background: #fcfdfe;
                    transform: translateX(6px);
                }

                .lesson-type-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .type-video { background: #eff6ff; color: #1d4ed8; }
                .type-live { background: #fee2e2; color: #b91c1c; }
                .type-material { background: #ecfdf5; color: #065f46; }
                .type-quiz { background: #fff7ed; color: #9a3412; }

                .add-lesson-bar {
                    padding: 2rem 2.5rem;
                    background: rgba(248, 250, 252, 0.6);
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    gap: 1.5rem;
                    justify-content: center;
                }

                .type-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 14px;
                    border: 2px dashed #cbd5e1;
                    background: white;
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .type-btn:hover {
                    border-style: solid;
                    border-color: #020617;
                    color: #020617;
                    background: white;
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 10px 20px -5px rgba(2, 6, 23, 0.15);
                }

                .sticky-actions-bar {
                    position: fixed;
                    bottom: 2.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    width: min(1000px, 92%);
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px) saturate(180%);
                    padding: 1.25rem 3rem;
                    border-radius: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
                    z-index: 100;
                }

                .btn-standard {
                    height: 52px;
                    padding: 0 2rem;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    border: none;
                    color: white;
                }

                .format-card {
                    cursor: pointer;
                    border: 2px solid #f1f5f9;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 18px;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    transition: all 0.3s;
                    position: relative;
                }

                .format-card:hover {
                    border-color: #cbd5e1;
                    background: #fcfdfe;
                }

                .format-card.selected {
                    border-color: #020617;
                    background: rgba(2, 6, 23, 0.04);
                }

                .format-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: all 0.3s;
                }

                .format-card.selected .format-icon {
                    background: #020617;
                    color: white;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Step Wizard Header */}
            <div className="step-indicator-bar">
                {['Basic Info', 'Curriculum', 'Settings', 'Publish'].map((label, i) => (
                    <div key={i} className={`step-item ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {step > i + 1 ? <CheckCircle2 size={24} /> : i + 1}
                        </div>
                        <span className="step-label">{label}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
                <div className="form-section-card animate-fade-in-up">
                    <h3 className="section-title">
                        <Layout size={32} color="#020617" style={{ background: 'rgba(2, 6, 23, 0.08)', padding: '8px', borderRadius: '14px' }} />
                        Course Foundations & Identity
                    </h3>

                    <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '4.5rem' }}>
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div>
                                    <label className="input-label">Project Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" className="custom-input" placeholder="Give your course a high-impact name..." />
                                </div>
                                <div>
                                    <label className="input-label">Core Description</label>
                                    <textarea className="custom-input" rows={6} placeholder="Summarize the learning transformation students will experience..." style={{ resize: 'none' }} />
                                </div>
                            </div>

                            <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label className="input-label">Market Category</label>
                                    <select className="custom-input">
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Target Level</label>
                                    <select className="custom-input">
                                        <option>Foundational / Beginner</option>
                                        <option>Professional / Intermediate</option>
                                        <option>Advanced / Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label className="input-label"><Globe size={18} /> Medium of Instruction</label>
                                    <select className="custom-input">
                                        <option>English Language</option>
                                        <option>Hausa Language</option>
                                        <option>French Language</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label"><Clock size={18} /> Estimated Time</label>
                                    <input type="text" className="custom-input" placeholder="e.g. 12h 30m" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div style={{ padding: '3rem 2rem', border: '3px dashed #e2e8f0', borderRadius: '40px', textAlign: 'center', background: '#f8fafc', display: 'flex', flexDirection: 'column', minHeight: '360px', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.04)' }}>
                                    <UploadCloud size={48} color="#020617" />
                                </div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>Course Poster</h4>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '240px', margin: '0 auto' }}>
                                    Upload a landscape cover. Recommended aspect ratio <strong>16:9</strong>.
                                </p>
                                <button className="btn-standard" style={{ marginTop: '2rem', background: '#020617', width: 'fit-content', alignSelf: 'center', boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.2)' }}>
                                    Browse Files
                                </button>
                            </div>

                            <div style={{ background: deliveryStatus.bg, padding: '2.5rem', borderRadius: '32px', border: `1px solid ${deliveryStatus.color}20`, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.1 }}>
                                    {deliveryStatus.icon}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: deliveryStatus.color, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        {deliveryStatus.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Detection</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 900, color: deliveryStatus.color }}>{deliveryStatus.label}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                    This course is automatically categorized based on your curriculum modules and session types.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="responsive-three-col" style={{ marginTop: '5rem', padding: '3.5rem', background: '#fcfdfe', borderRadius: '36px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3rem' }}>
                        <div>
                            <label className="input-label">Pricing Mode</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input type="number" className="custom-input" placeholder="0.00" />
                                <button style={{ height: '52px', padding: '0 1.5rem', borderRadius: '16px', background: '#f1f5f9', color: '#020617', fontWeight: 900, border: 'none', fontSize: '0.75rem' }}>FREE</button>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Max Students</label>
                            <input type="number" className="custom-input" placeholder="No limit" />
                        </div>
                        <div>
                            <label className="input-label">Keywords</label>
                            <input type="text" className="custom-input" placeholder="e.g. Design, React, Startup" />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Curriculum Builder */}
            {step === 2 && (
                <div className="form-section-card animate-fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>
                                <BookOpen size={32} color="#020617" style={{ background: 'rgba(2, 6, 23, 0.08)', padding: '8px', borderRadius: '14px' }} />
                                Curriculum Architecture
                            </h3>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Design the learning path for your students' growth.</p>
                        </div>
                        <button onClick={addModule} className="btn-standard" style={{ background: '#020617', padding: '0 2rem', boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.2)' }}>
                            <Plus size={20} /> New Module
                        </button>
                    </div>

                    <div className="curriculum-container">
                        {modules.map((mod, modIdx) => (
                            <div key={mod.id} className="curriculum-module">
                                <div className="module-header" onClick={() => toggleModule(mod.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1.5px solid #e2e8f0', color: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                            {modIdx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="module-title-inline-input"
                                            value={mod.title}
                                            onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '1.2rem',
                                                fontWeight: 800,
                                                color: '#0f172a',
                                                outline: 'none',
                                                width: '100%',
                                                padding: '4px 0',
                                                borderBottom: '2px solid transparent'
                                            }}
                                            onFocus={(e) => e.target.style.borderBottomColor = '#020617'}
                                            onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mod.lessons.length} {mod.lessons.length === 1 ? 'Unit' : 'Units'}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeModule(mod.id); }}
                                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                                            className="hover-danger"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronDown size={22} color="#64748b" style={{ transform: mod.isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s' }} />
                                    </div>
                                </div>
                                {mod.isOpen && (
                                    <div className="module-content" style={{ paddingBottom: '1.5rem' }}>
                                        {mod.lessons.map((lesson) => (
                                            <div key={lesson.id} style={{ marginBottom: '0.25rem' }}>
                                                <div className="lesson-card">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                        <GripVertical size={20} color="#cbd5e1" style={{ cursor: 'grab' }} />
                                                        <div className={`lesson-type-badge type-${lesson.type}`}>
                                                            {lesson.type === 'video' && <Video size={14} />}
                                                            {lesson.type === 'live' && <Users size={14} />}
                                                            {lesson.type === 'material' && <FileText size={14} />}
                                                            {lesson.type === 'quiz' && <HelpCircle size={14} />}
                                                            {lesson.type === 'material' ? 'Docs' : lesson.type === 'quiz' ? 'Assessment' : lesson.type === 'live' ? 'Live Class' : 'Video'}
                                                        </div>
                                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#334155' }}>{lesson.title}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <button
                                                            className="btn-standard"
                                                            style={{ height: '40px', width: '40px', padding: 0, background: editingLessonId === lesson.id ? '#020617' : '#f8fafc', border: '1px solid #e2e8f0', color: editingLessonId === lesson.id ? 'white' : '#64748b' }}
                                                            onClick={(e) => { e.stopPropagation(); setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id); }}
                                                            title="Configure Session"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-standard"
                                                            style={{ height: '40px', width: '40px', padding: 0, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
                                                            onClick={(e) => { e.stopPropagation(); setViewingLesson(lesson); }}
                                                            title="Preview"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-standard"
                                                            style={{ height: '40px', width: '40px', padding: 0, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                            onClick={(e) => { e.stopPropagation(); removeLesson(mod.id, lesson.id); }}
                                                            title="Remove"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {editingLessonId === lesson.id && (
                                                    <div className="animate-fade-in" style={{ margin: '0 2.5rem 1.5rem 2.5rem', background: '#fcfdfe', border: '1.5px solid #e2e8f0', borderRadius: '0 0 24px 24px', borderTop: 'none', padding: '2.5rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.03)' }}>
                                                        <div style={{ display: 'grid', gap: '2rem' }}>
                                                            <div>
                                                                <label className="input-label">Session Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="custom-input"
                                                                    value={lesson.title}
                                                                    onChange={(e) => updateLesson(mod.id, lesson.id, { title: e.target.value })}
                                                                    placeholder="Enter a descriptive title..."
                                                                />
                                                            </div>

                                                            {lesson.type === 'video' && (
                                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                                                                        <div>
                                                                            <label className="input-label">Video Hosting</label>
                                                                            <select
                                                                                className="custom-input"
                                                                                value={lesson.videoSource || 'upload'}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, { videoSource: e.target.value as any })}
                                                                            >
                                                                                <option value="upload">LayosCloud Direct Upload</option>
                                                                                <option value="youtube">YouTube Embed</option>
                                                                                <option value="vimeo">Vimeo Embed</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="input-label">Video Run Time</label>
                                                                            <input
                                                                                type="text"
                                                                                className="custom-input"
                                                                                value={lesson.duration || ''}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, { duration: e.target.value })}
                                                                                placeholder="e.g. 12:45"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {lesson.videoSource === 'upload' ? (
                                                                        <div style={{ padding: '3rem', border: '2.5px dashed #cbd5e1', borderRadius: '20px', textAlign: 'center', background: 'white', cursor: 'pointer' }}>
                                                                            <UploadCloud size={40} color="#020617" style={{ marginBottom: '1rem' }} />
                                                                            <h5 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Upload Video File</h5>
                                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Supports 4K/HD formats up to 2GB</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <label className="input-label">{lesson.videoSource === 'youtube' ? 'YouTube' : 'Vimeo'} URL</label>
                                                                            <input
                                                                                type="text"
                                                                                className="custom-input"
                                                                                value={lesson.videoUrl || ''}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, { videoUrl: e.target.value })}
                                                                                placeholder="https://..."
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {lesson.type === 'live' && (
                                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                                        <div>
                                                                            <label className="input-label">Class Date</label>
                                                                            <input
                                                                                type="date"
                                                                                className="custom-input"
                                                                                value={lesson.liveDate || ''}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, { liveDate: e.target.value })}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="input-label">Start Time</label>
                                                                            <input
                                                                                type="time"
                                                                                className="custom-input"
                                                                                value={lesson.liveTime || ''}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, { liveTime: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="input-label">Meeting Provider</label>
                                                                        <select
                                                                            className="custom-input"
                                                                            value={lesson.livePlatform || 'Zoom'}
                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, { livePlatform: e.target.value })}
                                                                        >
                                                                            <option>Zoom Video Communications</option>
                                                                            <option>Google Meet</option>
                                                                            <option>Layos Internal Live Room</option>
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="input-label">Secure Meeting Link</label>
                                                                        <input
                                                                            type="text"
                                                                            className="custom-input"
                                                                            value={lesson.liveLink || ''}
                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, { liveLink: e.target.value })}
                                                                            placeholder="https://zoom.us/j/..."
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {lesson.type === 'material' && (
                                                                <div style={{ padding: '3rem', border: '2.5px dashed #cbd5e1', borderRadius: '20px', textAlign: 'center', background: 'white' }}>
                                                                    <FileText size={40} color="#020617" style={{ marginBottom: '1rem' }} />
                                                                    <h5 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Deploy Document Resource</h5>
                                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Upload PDFs, Slides, or Blueprint assets (Max 50MB)</p>
                                                                    <input type="file" style={{ display: 'none' }} id={`file-upload-${lesson.id}`} />
                                                                    <button
                                                                        className="btn-standard"
                                                                        style={{ marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#020617' }}
                                                                        onClick={() => document.getElementById(`file-upload-${lesson.id}`)?.click()}
                                                                    >
                                                                        Browse Files
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {lesson.type === 'quiz' && (
                                                                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                                        <HelpCircle size={20} color="#020617" />
                                                                        <h5 style={{ margin: 0, fontWeight: 800 }}>Assessment Logic Configuration</h5>
                                                                    </div>
                                                                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>Configure passing thresholds and deployment rules for this validation unit.</p>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                                                                        <div>
                                                                            <label className="input-label">Pass Mark (%)</label>
                                                                            <input type="number" className="custom-input" placeholder="80" defaultValue="80" />
                                                                        </div>
                                                                        <button className="btn-standard" style={{ alignSelf: 'flex-end', background: '#020617' }}>Design Quiz Questions</button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                                                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                                                                        <input type="checkbox" checked={lesson.isPreview} onChange={(e) => updateLesson(mod.id, lesson.id, { isPreview: e.target.checked })} style={{ accentColor: '#020617' }} />
                                                                        Enable Preview
                                                                    </label>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                                                                        <input type="checkbox" checked={lesson.isLocked} onChange={(e) => updateLesson(mod.id, lesson.id, { isLocked: e.target.checked })} style={{ accentColor: '#020617' }} />
                                                                        Prerequisite Lock
                                                                    </label>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                                    <button onClick={() => setEditingLessonId(null)} className="btn-standard" style={{ background: '#1a4d3e' }}>Finish Setup</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div className="add-lesson-bar">
                                            <button onClick={() => addLesson(mod.id, 'video')} className="type-btn"><Video size={18} /> Video</button>
                                            <button onClick={() => addLesson(mod.id, 'live')} className="type-btn"><Users size={18} /> Live Class</button>
                                            <button onClick={() => addLesson(mod.id, 'material')} className="type-btn"><FileText size={18} /> Docs</button>
                                            <button onClick={() => addLesson(mod.id, 'quiz')} className="type-btn"><HelpCircle size={18} /> Assessment</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Advanced Settings */}
            {step === 3 && (
                <div className="form-section-card animate-fade-in-up">
                    <h3 className="section-title">
                        <MoreVertical size={32} color="#1a4d3e" style={{ background: '#1a4d3e14', padding: '8px', borderRadius: '14px' }} />
                        Operational Strategy
                    </h3>

                    <div style={{ display: 'grid', gap: '3rem' }}>
                        <div style={{ background: '#f8fafc', padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#1a4d3e', fontWeight: 900 }}>Commercial Model</h4>
                                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Decide if this course is a premium asset or the entry to your funnel.</p>
                            </div>
                            <div style={{ display: 'flex', background: 'white', padding: '8px', borderRadius: '18px', gap: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', border: '1.5px solid #e2e8f0' }}>
                                <button style={{ padding: '12px 28px', borderRadius: '14px', background: '#1a4d3e', color: 'white', fontSize: '0.9rem', fontWeight: 900, border: 'none' }}>Premium Asset</button>
                                <button style={{ padding: '12px 28px', borderRadius: '14px', background: 'transparent', color: '#64748b', fontSize: '0.9rem', fontWeight: 900, border: 'none' }}>Open Access</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
                            <div style={{ padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #f1f5f9', background: 'white', transition: 'all 0.3s' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><CheckCircle2 size={24} /></div>
                                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 900 }}>Accreditation</h5>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>Issue official LayosGroup verified certificates upon 100% completion.</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="checkbox" defaultChecked style={{ width: '24px', height: '24px', accentColor: '#1a4d3e' }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Enabled</span>
                                </div>
                            </div>
                            <div style={{ padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #f1f5f9', background: 'white' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><Users size={24} /></div>
                                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 900 }}>Community Hive</h5>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>Enable per-lesson Q&A and student collaborative project boards.</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="checkbox" defaultChecked style={{ width: '24px', height: '24px', accentColor: '#1a4d3e' }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Enabled</span>
                                </div>
                            </div>
                            <div style={{ padding: '2.5rem', borderRadius: '32px', border: '1.5px solid #f1f5f9', background: 'white' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><Clock size={24} /></div>
                                <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 900 }}>Retention Lock</h5>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>Control how long students maintain access to updated content.</p>
                                <select className="custom-input">
                                    <option>Lifetime Access</option>
                                    <option>12 Months Access</option>
                                    <option>6 Months Access</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Publish Review */}
            {step === 4 && (
                <div className="form-section-card animate-fade-in-up">
                    <h3 className="section-title">
                        <CheckCircle2 size={32} color="#1a4d3e" style={{ background: '#1a4d3e14', padding: '8px', borderRadius: '14px' }} />
                        Review and Publish
                    </h3>

                    <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>
                        Please review your course details before making it live to students.
                    </p>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1a4d3e' }}>Course Summary</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Structure</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: '1.1rem' }}>{modules.length} Modules</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Type</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: '1.1rem', color: deliveryStatus.color }}>{deliveryStatus.label}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Visibility</label>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: '1.1rem' }}>Public Marketplace</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Publishing Agreement</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <input type="checkbox" style={{ width: '24px', height: '24px', marginTop: '4px', accentColor: '#1a4d3e' }} />
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>
                                    I confirm that this course meets all quality standards and I have the rights to publish the content. I understand that my course will be visible to the public after publishing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Sticky Action Bar */}
            <div className="sticky-actions-bar">
                <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="btn-standard"
                    style={{ background: 'transparent', border: '1.5px solid #e2e8f0', color: '#475569', opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
                >
                    <ChevronLeft size={20} /> Back
                </button>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <button className="btn-standard" style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', fontWeight: 800, display: 'flex', gap: '8px' }}>
                        <Save size={20} /> Save Progress
                    </button>
                    <button
                        onClick={() => setStep(Math.min(4, step + 1))}
                        className="btn-standard"
                        style={{ background: '#1a4d3e', padding: '0 3rem', height: '60px', borderRadius: '18px', fontWeight: 900, display: 'flex', gap: '12px', boxShadow: '0 10px 20px -5px rgba(26, 77, 62, 0.3)' }}
                    >
                        {step === 4 ? 'Launch Course' : 'Proceed'}
                        {step === 4 ? <Globe size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>
            {/* Session Preview Modal */}
            {viewingLesson && (
                <div
                    className="modal-overlay animate-fade-in"
                    onClick={() => setViewingLesson(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                >
                    <div
                        className="animate-scale-up"
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'white', width: '100%', maxWidth: '700px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                    >
                        <div style={{ padding: '3rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div className={`lesson-type-badge type-${viewingLesson.type}`} style={{ transform: 'scale(1.2)' }}>
                                    {viewingLesson.type === 'video' && <Video size={16} />}
                                    {viewingLesson.type === 'live' && <Users size={16} />}
                                    {viewingLesson.type === 'material' && <FileText size={16} />}
                                    {viewingLesson.type === 'quiz' && <HelpCircle size={16} />}
                                </div>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>{viewingLesson.title}</h3>
                            </div>
                            <button onClick={() => setViewingLesson(null)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}>
                                <Trash2 size={20} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            {viewingLesson.type === 'video' && (
                                <div style={{ width: '100%', aspectRatio: '16/9', background: '#0f172a', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <Video size={48} opacity={0.5} />
                                    <p style={{ fontWeight: 800 }}>Video Stream Simulator</p>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{viewingLesson.videoSource === 'upload' ? 'LayosCloud Secure Feed' : viewingLesson.videoUrl}</span>
                                </div>
                            )}
                            {viewingLesson.type === 'live' && (
                                <div style={{ padding: '3rem', background: '#f0fdf4', borderRadius: '24px', border: '1.5px solid #1a4d3e20', marginBottom: '2rem' }}>
                                    <Users size={48} color="#1a4d3e" style={{ marginBottom: '1.5rem' }} />
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 900, color: '#1a4d3e' }}>Live Class Scheduled</h4>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#64748b' }}>{viewingLesson.liveDate} at {viewingLesson.liveTime}</p>
                                    <p style={{ margin: '8px 0 2rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Platform: {viewingLesson.livePlatform}</p>
                                    <button className="btn-standard" style={{ background: '#1a4d3e', padding: '0 2.5rem' }}>Join Preview Link</button>
                                </div>
                            )}
                            {viewingLesson.type === 'material' && (
                                <div style={{ padding: '3rem', background: '#eff6ff', borderRadius: '24px', border: '1.5px solid #2563eb20', marginBottom: '2rem' }}>
                                    <FileText size={48} color="#2563eb" style={{ marginBottom: '1.5rem' }} />
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>Document Hub Unit</h4>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#64748b' }}>PDF/Slides Asset Ready</p>
                                    <button className="btn-standard" style={{ background: '#2563eb', padding: '0 2.5rem', marginTop: '2rem' }}>Download Resource</button>
                                </div>
                            )}
                            {viewingLesson.type === 'quiz' && (
                                <div style={{ padding: '3rem', background: '#fefce8', borderRadius: '24px', border: '1.5px solid #ca8a0420', marginBottom: '2rem' }}>
                                    <HelpCircle size={48} color="#ca8a04" style={{ marginBottom: '1.5rem' }} />
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 900, color: '#ca8a04' }}>Knowledge Validation</h4>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#64748b' }}>Curriculum Assessment Node</p>
                                    <button className="btn-standard" style={{ background: '#ca8a04', padding: '0 2.5rem', marginTop: '2rem' }}>Start Simulator</button>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: viewingLesson.isLocked ? '#ef4444' : '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                                    {viewingLesson.isLocked ? <Lock size={14} /> : <CheckCircle2 size={14} />}
                                    {viewingLesson.isLocked ? 'Locked for Students' : 'Free Access'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: viewingLesson.isPreview ? '#1a4d3e' : '#64748b', fontWeight: 800, fontSize: '0.85rem' }}>
                                    <Eye size={14} />
                                    {viewingLesson.isPreview ? 'Publicly Previewable' : 'Enrollment Required'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
