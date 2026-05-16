import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ChevronLeft,
    Save,
    Plus,
    Video,
    Users,
    FileText,
    Layout,
    Edit2,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Trash2,
    GripVertical,
    CheckCircle2,
    Clock,
    Eye,
    UploadCloud,
    BookOpen,
    Lock,
    AlertCircle,
    X,
    Loader2,
    Cloud,
    Upload,
    ArrowRight,
    Sparkles,
    Target,
    Zap,
    ShieldCheck,
    Layers,
    Monitor,
    Globe,
    Pointer,
    Calendar,
    Smartphone
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
    fileToUpload?: File;
    videoToUpload?: File;
    quizData?: {
        pass_mark: number;
        questions: Array<{
            id: string;
            question: string;
            options: string[];
            correct_answer: number;
        }>;
    };
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    isOpen: boolean;
}

export default function CreateCourse() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id: cohortIdFromUrl } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cohorts, setCohorts] = useState<Array<{ id: string, name: string, delivery_mode?: string }>>([]);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: 'video',
        thumbnail: null as string | null
    });

    const [modules, setModules] = useState<Module[]>([
        {
            id: 'm1',
            title: 'Foundational Module',
            isOpen: true,
            lessons: [
                { id: 'l1', title: 'Curriculum Initiation', type: 'video', isLocked: false, isPreview: true }
            ]
        }
    ]);

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!courseData.title.trim()) return "Course title is required.";
            if (!courseData.description.trim()) return "Course description is required.";
            if (!courseData.thumbnail) return "Course thumbnail is required.";
        } else if (currentStep === 2) {
            if (!selectedCohortId) return "Please select a target cohort for this course.";
        } else if (currentStep === 3) {
            if (modules.length === 0) return "At least one module is required.";
            for (const mod of modules) {
                if (!mod.title.trim()) return "All modules must have a title.";
                if (mod.lessons.length === 0) return `Module "${mod.title}" must have at least one lesson.`;
                for (const lesson of mod.lessons) {
                    if (!lesson.title.trim()) return `Lesson in module "${mod.title}" must have a title.`;
                    if (lesson.type === 'video' && !lesson.videoUrl && !lesson.fileToUpload) return `Video lesson "${lesson.title}" needs a video file.`;
                    if (lesson.type === 'material' && !lesson.fileUrl && !lesson.fileToUpload) return `Material lesson "${lesson.title}" needs a document file.`;
                    if (lesson.type === 'live' && (!lesson.liveDate || !lesson.liveTime || !lesson.liveLink)) return `Live class "${lesson.title}" needs complete date, time and link.`;
                }
            }
        } else if (currentStep === 4) {
            if (!confirmed) return "You must confirm compliance before finalizing.";
        }
        return null;
    };

    useEffect(() => {
        const fetchCohorts = async () => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            try {
                const response = await fetch(`${API_URL}/cohorts`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCohorts(data);
                }
            } catch (err) {
                console.error("Failed to fetch cohorts:", err);
            }
        };
        fetchCohorts();

        if (cohortIdFromUrl) {
            setSelectedCohortId(cohortIdFromUrl);
        }
    }, [cohortIdFromUrl]);

    const handleSaveCourse = async () => {
        const validationError = validateStep(4);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);
        setLoadingText('Initiating Deployment Protocol...');

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');

        try {
            const payload = {
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                thumbnail: courseData.thumbnail,
                instructor_id: user?.id,
                modules: modules.map((m: Module) => ({
                    title: m.title,
                    lessons: m.lessons.map((l: Lesson) => ({
                        title: l.title,
                        type: l.type,
                        description: l.description,
                        is_locked: l.isLocked,
                        is_preview: l.isPreview,
                        video_url: l.videoUrl,
                        video_source: l.videoSource,
                        live_date: l.liveDate,
                        live_time: l.liveTime,
                        live_platform: l.livePlatform,
                        live_link: l.liveLink,
                        file_url: l.fileUrl,
                        file_name: l.fileName,
                        quiz_data: l.quizData
                    }))
                }))
            };

            const response = await fetch(`${API_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Deployment protocol failed.');
            }

            if (selectedCohortId) {
                await fetch(`${API_URL}/cohorts/${selectedCohortId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({ course_id: data.id })
                });
            }

            setLoadingText('Curriculum Successfully Deployed!');
            setShowSuccess(true);

            setTimeout(() => {
                navigate('/instructor/courses');
            }, 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred during synchronization.');
        } finally {
            setLoading(false);
        }
    };

    // UI Logic states
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
    const [uploadingVideos, setUploadingVideos] = useState<{ [lessonId: string]: boolean }>({});
    const [uploadProgress, setUploadProgress] = useState<{ [lessonId: string]: number }>({});
    const [isBrowsingVideos, setIsBrowsingVideos] = useState(false);
    const [existingVideos, setExistingVideos] = useState<any[]>([]);
    const [browsingLessonContext, setBrowsingLessonContext] = useState<{ moduleId: string; lessonId: string } | null>(null);

    const handleFileUpload = async (moduleId: string, lessonId: string, file: File) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');

        setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: true }));
        setUploadProgress((prev: any) => ({ ...prev, [lessonId]: 0 }));

        const formData = new FormData();
        formData.append('video', file);

        try {
            const url = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_URL}/upload-video`, true);
                xhr.setRequestHeader('Accept', 'application/json');
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress((prev: any) => ({ ...prev, [lessonId]: percentComplete }));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success && data.video_url) resolve(data.video_url);
                            else reject(data.message || 'Asset synchronization failed.');
                        } catch { reject('Error decoding response manifest.'); }
                    } else { reject(`Error during artifact transmission. Status: ${xhr.status}`); }
                };

                xhr.onerror = () => reject('Network interruption during transmission.');
                xhr.send(formData);
            });

            const lesson = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
            if (lesson?.type === 'material') {
                updateLesson(moduleId, lessonId, { fileUrl: url as string, fileName: file.name });
            } else {
                updateLesson(moduleId, lessonId, { videoUrl: url as string });
            }
        } catch (err: any) {
            setError(err.message || 'Asset deployment failed.');
        } finally {
            setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: false }));
        }
    };

    const handleDeleteVideo = async (moduleId: string, lessonId: string, videoUrl: string) => {
        if (!window.confirm('Are you sure you want to redact this instructional artifact?')) return;

        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/delete-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ video_url: videoUrl })
            });

            if (response.ok) {
                updateLesson(moduleId, lessonId, { videoUrl: '', fileUrl: '', fileName: '' });
            } else {
                throw new Error('Failed to redact artifact.');
            }
        } catch (err: any) {
            setError(err.message || 'Redaction sequence failed.');
        }
    };

    const fetchExistingVideos = async (moduleId: string, lessonId: string) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/course-videos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setExistingVideos(data);
                setBrowsingLessonContext({ moduleId, lessonId });
                setIsBrowsingVideos(true);
            }
        } catch (err) {
            setError("Failed to synchronize with asset repository.");
        }
    };

    const selectExistingVideo = (videoUrl: string) => {
        if (browsingLessonContext) {
            updateLesson(browsingLessonContext.moduleId, browsingLessonContext.lessonId, { videoUrl });
            setIsBrowsingVideos(false);
            setBrowsingLessonContext(null);
        }
    };

    const addModule = () => {
        const newModule: Module = {
            id: 'm' + Date.now(),
            title: `Instructional Phase ${modules.length + 1}`,
            lessons: [],
            isOpen: true
        };
        setModules([...modules, newModule]);
    };

    const addLesson = (moduleId: string, type: Lesson['type']) => {
        setModules(modules.map((mod: Module) => {
            if (mod.id === moduleId) {
                return {
                    ...mod,
                    lessons: [...mod.lessons, {
                        id: 'l' + Date.now(),
                        title: `New ${type === 'material' ? 'Resource' : type === 'quiz' ? 'Evaluation' : type === 'live' ? 'Live Session' : 'Unit'}`,
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
        setModules(modules.map((m: Module) => m.id === id ? { ...m, isOpen: !m.isOpen } : m));
    };

    const removeModule = (id: string) => {
        if (window.confirm('Redact this instructional module and all associated artifacts?')) {
            setModules(modules.filter((m: Module) => m.id !== id));
        }
    };

    const updateModuleTitle = (id: string, title: string) => {
        setModules(modules.map((m: Module) => m.id === id ? { ...m, title } : m));
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        if (window.confirm('Redact this instructional unit?')) {
            setModules(modules.map((mod: Module) => {
                if (mod.id === moduleId) {
                    return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
                }
                return mod;
            }));
        }
    };

    const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
        setModules(modules.map((mod: Module) => {
            if (mod.id === moduleId) {
                return {
                    ...mod,
                    lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
                };
            }
            return mod;
        }));
    };

    const nextStep = () => {
        const error = validateStep(step);
        if (error) {
            setError(error);
            return;
        }
        setStep(step + 1);
        setError(null);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(step - 1);
        setError(null);
        window.scrollTo(0, 0);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-0 pb-32 space-y-12">
            {/* Step Wizard */}
            <nav className="flex justify-between items-center relative py-12 px-4 gap-4 overflow-x-auto custom-scrollbar no-scrollbar">
                <div className="absolute top-[4.5rem] left-12 right-12 h-1 bg-brand-beige dark:bg-white/5 rounded-full -z-10"></div>
                {['Metadata', 'Deployment', 'Architecture', 'Finalization'].map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 min-w-[120px] flex-1">
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 z-10
                            ${step === i + 1 ? 'bg-brand-charcoal dark:bg-brand-emerald text-white scale-110 shadow-2xl shadow-brand-emerald/30' : 
                              step > i + 1 ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal text-brand-muted border-2 border-brand-border'}
                        `}>
                            {step > i + 1 ? <CheckCircle2 size={24} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${step === i + 1 ? 'text-brand-charcoal dark:text-white' : 'text-brand-muted'}`}>{label}</span>
                    </div>
                ))}
            </nav>

            {/* Error Notification */}
            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-6 rounded-3xl flex items-center gap-4 animate-fade-in-up">
                    <AlertCircle className="text-red-500 shrink-0" size={24} />
                    <span className="text-red-600 dark:text-red-400 font-bold text-sm flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all border-none cursor-pointer">
                        <X size={18} className="text-red-500" />
                    </button>
                </div>
            )}

            {/* Content Frames */}
            <main className="space-y-16">
                {/* Step 1: Course Details */}
                {step === 1 && (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-8 md:p-16 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-brand-emerald/10 rounded-2xl">
                                <Monitor className="text-brand-emerald" size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Curriculum Metadata</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            <div className="lg:col-span-7 space-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Curriculum Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full h-16 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold text-xl"
                                        placeholder="e.g. Strategic Brand Architecture"
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Instructional Narrative</label>
                                    <textarea
                                        className="w-full p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold text-lg min-h-[200px] resize-none"
                                        placeholder="Articulate the learning transformation and terminal objectives..."
                                        value={courseData.description}
                                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Primary Delivery Modality</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 'video', label: 'VOD Units', icon: Video },
                                            { id: 'live', label: 'Live Events', icon: Users },
                                            { id: 'material', label: 'Resource Hub', icon: FileText },
                                            { id: 'quiz', label: 'Evaluations', icon: ShieldCheck }
                                        ].map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCourseData({ ...courseData, category: cat.id })}
                                                className={`
                                                    p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-4 group border-none cursor-pointer
                                                    ${courseData.category === cat.id ? 'bg-brand-emerald text-white border-brand-emerald shadow-xl shadow-brand-emerald/20' : 'bg-brand-beige/30 dark:bg-white/5 border-brand-border text-brand-muted hover:border-brand-emerald/50'}
                                                `}
                                            >
                                                <cat.icon size={28} className={courseData.category === cat.id ? 'text-white' : 'text-brand-muted group-hover:text-brand-emerald'} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5">
                                <div className="p-10 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-xl space-y-8">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] block text-center">Visual Identity (Thumbnail)</label>
                                    <div 
                                        className="relative group cursor-pointer aspect-video rounded-[32px] overflow-hidden bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed hover:border-brand-emerald transition-all"
                                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                    >
                                        {courseData.thumbnail ? (
                                            <>
                                                <img src={courseData.thumbnail} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                                                <div className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <UploadCloud className="text-white" size={40} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-brand-muted">
                                                <UploadCloud size={48} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Select Image Artifact</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="thumbnail-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => setCourseData({ ...courseData, thumbnail: ev.target?.result as string });
                                                    reader.readAsDataURL(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-brand-charcoal/50 p-6 rounded-2xl border border-brand-border flex items-start gap-4">
                                        <div className="p-2 bg-brand-emerald/10 rounded-lg shrink-0">
                                            <Pointer size={18} className="text-brand-emerald" />
                                        </div>
                                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-relaxed">Recommended resolution: 1920x1080px. High-fidelity visuals enhance enrollment synchronization.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Target Cohort */}
                {step === 2 && (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-8 md:p-16 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-brand-emerald/10 rounded-2xl">
                                <Globe className="text-brand-emerald" size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Deployment Strategy</h2>
                        </div>

                        <p className="text-brand-muted font-medium text-lg mb-10">Select the operational cohort that will be synchronized with this curriculum blueprint.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cohorts.map((cohort) => (
                                <button
                                    key={cohort.id}
                                    onClick={() => setSelectedCohortId(cohort.id)}
                                    className={`
                                        p-10 rounded-[32px] border-2 transition-all text-left flex justify-between items-center group border-none cursor-pointer
                                        ${selectedCohortId === cohort.id ? 'bg-brand-emerald border-brand-emerald shadow-2xl shadow-brand-emerald/20' : 'bg-brand-beige/20 dark:bg-white/5 border-brand-border hover:border-brand-emerald/50'}
                                    `}
                                >
                                    <div className="space-y-2">
                                        <h4 className={`text-xl font-black uppercase tracking-tight transition-colors ${selectedCohortId === cohort.id ? 'text-white' : 'text-brand-charcoal dark:text-white'}`}>{cohort.name}</h4>
                                        <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedCohortId === cohort.id ? 'text-white/70' : 'text-brand-muted'}`}>ID: {cohort.id}</div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedCohortId === cohort.id ? 'bg-white text-brand-emerald scale-110' : 'bg-brand-beige dark:bg-white/10 text-brand-muted group-hover:scale-110'}`}>
                                        <Target size={24} />
                                    </div>
                                </button>
                            ))}

                            <button 
                                onClick={() => navigate('/instructor/cohorts/create')}
                                className="p-10 rounded-[32px] border-4 border-brand-border border-dashed text-brand-muted hover:text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all flex flex-col items-center justify-center gap-4 group border-none cursor-pointer"
                            >
                                <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="font-black text-xs uppercase tracking-widest">Initialize New Operational Cycle</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Curriculum Builder */}
                {step === 3 && (
                    <div className="space-y-12 animate-fade-in-up">
                        <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-brand-charcoal/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-emerald/10 rounded-2xl">
                                    <Layers className="text-brand-emerald" size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Curriculum Architecture</h2>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Mapping instructional phases & artifacts</p>
                                </div>
                            </div>
                            <button 
                                onClick={addModule}
                                className="h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                            >
                                <Plus size={20} /> Add Instructional Phase
                            </button>
                        </div>

                        <div className="space-y-8">
                            {modules.map((mod, idx) => (
                                <div key={mod.id} className={`bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden transition-all duration-500 ${mod.isOpen ? 'shadow-2xl shadow-brand-charcoal/5 ring-1 ring-brand-emerald/20' : 'shadow-sm'}`}>
                                    {/* Module Header */}
                                    <div 
                                        className="flex items-center gap-6 p-8 md:p-10 cursor-pointer select-none"
                                        onClick={() => toggleModule(mod.id)}
                                    >
                                        <div className="w-12 h-12 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center text-brand-muted shrink-0">
                                            <GripVertical size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight focus:outline-none focus:text-brand-emerald transition-colors"
                                                value={mod.title}
                                                onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Phase Identifier..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest hidden md:block">{mod.lessons.length} Units Synchronized</span>
                                            <button onClick={() => removeModule(mod.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                                                <Trash2 size={18} />
                                            </button>
                                            <div className={`w-10 h-10 flex items-center justify-center bg-brand-beige dark:bg-white/5 border border-brand-border rounded-xl text-brand-muted transition-transform duration-500 ${mod.isOpen ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module Lessons */}
                                    {mod.isOpen && (
                                        <div className="px-8 md:px-10 pb-10 space-y-6 animate-fade-in-up">
                                            <div className="border-t border-brand-border pt-10 grid grid-cols-1 gap-4">
                                                {mod.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex flex-col gap-0">
                                                        <div className={`
                                                            flex items-center justify-between p-6 bg-white dark:bg-brand-charcoal border border-brand-border transition-all duration-300
                                                            ${editingLessonId === lesson.id ? 'rounded-t-[28px] border-brand-emerald shadow-xl' : 'rounded-[28px] hover:shadow-xl hover:shadow-brand-charcoal/5'}
                                                        `}>
                                                            <div className="flex items-center gap-6">
                                                                <div className={`
                                                                    w-12 h-12 rounded-xl flex items-center justify-center shadow-inner
                                                                    ${lesson.type === 'video' ? 'bg-blue-500/10 text-blue-600' : 
                                                                      lesson.type === 'live' ? 'bg-red-500/10 text-red-600' : 
                                                                      lesson.type === 'material' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}
                                                                `}>
                                                                    {lesson.type === 'video' && <Video size={20} />}
                                                                    {lesson.type === 'live' && <Activity size={20} />}
                                                                    {lesson.type === 'material' && <FileText size={20} />}
                                                                    {lesson.type === 'quiz' && <HelpCircle size={20} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h5 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{lesson.title}</h5>
                                                                    <div className="flex items-center gap-2 text-[8px] font-black text-brand-muted uppercase tracking-widest">
                                                                        <span className="text-brand-emerald">{lesson.type === 'quiz' ? 'Evaluation' : lesson.type}</span>
                                                                        {lesson.isPreview && <span className="px-2 py-0.5 bg-brand-emerald/10 text-brand-emerald rounded">Preview Active</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}
                                                                    className={`h-10 px-4 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${editingLessonId === lesson.id ? 'bg-brand-charcoal text-white' : 'bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                                                                >
                                                                    <Edit2 size={14} /> {editingLessonId === lesson.id ? 'Close' : 'Configure'}
                                                                </button>
                                                                <button onClick={() => removeLesson(mod.id, lesson.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Inline Lesson Editor */}
                                                        {editingLessonId === lesson.id && (
                                                            <div className="p-8 md:p-12 bg-brand-beige/20 dark:bg-white/5 border-x border-b border-brand-emerald/30 rounded-b-[28px] space-y-10 animate-fade-in-up">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Unit Identifier</label>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full h-14 px-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white"
                                                                            value={lesson.title}
                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, { title: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Synchronization Protocols</label>
                                                                        <div className="flex gap-4">
                                                                            <button 
                                                                                onClick={() => updateLesson(mod.id, lesson.id, { isPreview: !lesson.isPreview })}
                                                                                className={`flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${lesson.isPreview ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}
                                                                            >
                                                                                <Eye size={18} /> Open Preview
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => updateLesson(mod.id, lesson.id, { isLocked: !lesson.isLocked })}
                                                                                className={`flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${lesson.isLocked ? 'bg-brand-charcoal text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}
                                                                            >
                                                                                <Lock size={18} /> Enforce Lock
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Type Specific Assets */}
                                                                <div className="space-y-6">
                                                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Artifact Repository</label>
                                                                    {lesson.type === 'video' && (
                                                                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed rounded-[32px] text-center gap-6">
                                                                            {uploadingVideos[lesson.id] ? (
                                                                                <div className="w-full max-w-sm space-y-6">
                                                                                    <Loader2 className="animate-spin text-brand-emerald mx-auto" size={40} />
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex justify-between text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                                                                            <span>Transmitting Bitstream...</span>
                                                                                            <span>{uploadProgress[lesson.id] || 0}%</span>
                                                                                        </div>
                                                                                        <div className="h-2 bg-brand-beige dark:bg-white/10 rounded-full overflow-hidden">
                                                                                            <div className="h-full bg-brand-emerald transition-all duration-300" style={{ width: `${uploadProgress[lesson.id] || 0}%` }}></div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : lesson.videoUrl ? (
                                                                                <div className="flex flex-col items-center gap-4">
                                                                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                                                                        <CheckCircle2 size={32} />
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <h6 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Artifact Synchronized</h6>
                                                                                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest line-clamp-1 max-w-[300px]">{lesson.videoUrl}</p>
                                                                                    </div>
                                                                                    <button onClick={() => handleDeleteVideo(mod.id, lesson.id, lesson.videoUrl!)} className="h-10 px-6 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">Redact Artifact</button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center gap-8">
                                                                                    <UploadCloud size={48} className="text-brand-muted" />
                                                                                    <div className="flex gap-4">
                                                                                        <button 
                                                                                            onClick={() => document.getElementById(`video-up-${lesson.id}`)?.click()}
                                                                                            className="h-12 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all border-none cursor-pointer"
                                                                                        >
                                                                                            Deploy Local Asset
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => fetchExistingVideos(mod.id, lesson.id)}
                                                                                            className="h-12 px-8 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-brand-border transition-all border-none cursor-pointer"
                                                                                        >
                                                                                            Search Repository
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <input id={`video-up-${lesson.id}`} type="file" className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(mod.id, lesson.id, e.target.files[0])} />
                                                                        </div>
                                                                    )}

                                                                    {lesson.type === 'live' && (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[32px]">
                                                                            <div className="space-y-4">
                                                                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Operational Date</label>
                                                                                <input type="date" className="w-full h-14 px-6 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white" value={lesson.liveDate} onChange={(e) => updateLesson(mod.id, lesson.id, { liveDate: e.target.value })} />
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Transmission Link</label>
                                                                                <input type="text" className="w-full h-14 px-6 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald transition-all font-bold text-brand-charcoal dark:text-white" value={lesson.liveLink} onChange={(e) => updateLesson(mod.id, lesson.id, { liveLink: e.target.value })} placeholder="https://synchronization.endpoint/..." />
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {lesson.type === 'material' && (
                                                                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed rounded-[32px] text-center gap-6">
                                                                             <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center shadow-inner">
                                                                                <FileText size={32} />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <h6 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Technical Repository</h6>
                                                                                <p className="text-brand-muted font-medium text-sm">Upload blueprints, PDF artifacts, or instructional documents.</p>
                                                                            </div>
                                                                            <button onClick={() => document.getElementById(`doc-up-${lesson.id}`)?.click()} className="h-14 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 border-none cursor-pointer">Select PDF Artifact</button>
                                                                            <input id={`doc-up-${lesson.id}`} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => e.target.files?.[0] && handleFileUpload(mod.id, lesson.id, e.target.files[0])} />
                                                                        </div>
                                                                    )}

                                                                    {lesson.type === 'quiz' && (
                                                                        <div className="p-12 bg-amber-500/10 border-2 border-amber-500/30 rounded-[32px] text-center space-y-6">
                                                                            <HelpCircle className="text-amber-600 mx-auto" size={48} />
                                                                            <div className="space-y-2">
                                                                                <h6 className="text-2xl font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight leading-none">Cognitive Evaluation Matrix</h6>
                                                                                <p className="text-amber-700/70 dark:text-amber-400/70 font-medium max-w-md mx-auto">Configure serialized validation questions to measure curriculum comprehension.</p>
                                                                            </div>
                                                                            <button className="h-14 px-10 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 border-none cursor-pointer">Initiate Matrix Designer</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Lesson Controls */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                                {[
                                                    { id: 'video', label: 'VOD', icon: Video },
                                                    { id: 'live', label: 'Live', icon: Activity },
                                                    { id: 'material', label: 'Asset', icon: FileText },
                                                    { id: 'quiz', label: 'Quiz', icon: ShieldCheck }
                                                ].map((tp) => (
                                                    <button 
                                                        key={tp.id} 
                                                        onClick={() => addLesson(mod.id, tp.id as any)}
                                                        className="h-16 bg-brand-beige/10 dark:bg-white/5 border-2 border-brand-border border-dashed rounded-[20px] flex items-center justify-center gap-3 text-brand-muted hover:text-brand-emerald hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all group border-none cursor-pointer"
                                                    >
                                                        <tp.icon size={18} className="group-hover:scale-125 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{tp.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Finalization */}
                {step === 4 && (
                    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
                        <div className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-20 shadow-2xl shadow-brand-charcoal/5 text-center space-y-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-emerald/5 blur-3xl rounded-full -m-20 group-hover:bg-brand-emerald/10 transition-colors duration-1000"></div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="w-24 h-24 bg-brand-emerald text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-emerald/30 animate-bounce">
                                    <Sparkles size={48} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Launch Sequence Ready</h2>
                                    <p className="text-brand-muted font-medium text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                                        Your curriculum architecture has been successfully validated. Confirm compliance with instructional standards to initiate deployment.
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-center gap-4 p-8 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border">
                                <button 
                                    onClick={() => setConfirmed(!confirmed)}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${confirmed ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}
                                >
                                    {confirmed && <CheckCircle2 size={20} />}
                                </button>
                                <span className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Confirm Intellectual Property & Compliance Protocol</span>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-brand-charcoal p-10 rounded-xl border border-brand-border space-y-3">
                                <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Instructional Phases</div>
                                <div className="text-4xl font-black text-brand-emerald">{modules.length}</div>
                            </div>
                            <div className="bg-white dark:bg-brand-charcoal p-10 rounded-xl border border-brand-border space-y-3">
                                <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Total Assets</div>
                                <div className="text-4xl font-black text-brand-emerald">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</div>
                            </div>
                            <div className="bg-white dark:bg-brand-charcoal p-10 rounded-xl border border-brand-border space-y-3">
                                <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Deployment Cohort</div>
                                <div className="text-xl font-black text-brand-emerald truncate uppercase tracking-tight">{cohorts.find(c => c.id === selectedCohortId)?.name || 'Library Only'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Actions Bar */}
            <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-brand-charcoal/90 dark:bg-brand-emerald/90 backdrop-blur-2xl px-10 py-6 rounded-[32px] flex justify-between items-center z-[100] shadow-2xl shadow-brand-charcoal/40 border border-white/10 animate-fade-in-up">
                <div className="flex gap-4">
                    {step > 1 && (
                        <button 
                            onClick={prevStep}
                            className="h-14 px-8 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all border-none cursor-pointer"
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                    )}
                </div>

                <div className="flex gap-4 items-center">
                    <span className="hidden md:block text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Step {step} of 4</span>
                    {step < 4 ? (
                        <button 
                            onClick={nextStep}
                            className="h-14 px-12 bg-white text-brand-charcoal rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                        >
                            Proceed Phase <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSaveCourse}
                            disabled={!confirmed || loading}
                            className="h-14 px-12 bg-brand-emerald dark:bg-white text-white dark:text-brand-emerald rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all border-none cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Processing...' : 'Finalize Deployment'}
                        </button>
                    )}
                </div>
            </footer>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[2000] bg-brand-charcoal/95 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-fade-in">
                    <div className="max-w-xl space-y-12 animate-scale-up">
                        <div className="w-32 h-32 bg-brand-emerald text-white rounded-xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-emerald/40 animate-bounce">
                            <CheckCircle2 size={64} />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-5xl font-black text-white uppercase tracking-tight leading-none">Curriculum <span className="text-brand-emerald">Deployed</span></h2>
                            <p className="text-white/70 font-medium text-xl leading-relaxed">Your instructional architecture is now synchronized and available within the operational ecosystem.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-brand-emerald" size={32} />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Redirecting to Repository...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Video Browser Modal */}
            {isBrowsingVideos && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsBrowsingVideos(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-full bg-white dark:bg-brand-charcoal rounded-[60px] shadow-2xl overflow-y-auto custom-scrollbar animate-scale-up border border-white/10">
                        <div className="p-16 space-y-12">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Asset Repository</h3>
                                <button onClick={() => setIsBrowsingVideos(false)} className="w-12 h-12 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-red-500 rounded-full flex items-center justify-center transition-all border-none cursor-pointer">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {existingVideos.map((video, vIdx) => (
                                    <div key={vIdx} className="p-6 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-3xl flex justify-between items-center group hover:border-brand-emerald transition-all">
                                        <div className="space-y-1 flex-1 overflow-hidden">
                                            <h5 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight truncate">{video.title || 'Artifact Chunk'}</h5>
                                            <p className="text-[10px] font-bold text-brand-muted truncate">{video.video_url}</p>
                                        </div>
                                        <button 
                                            onClick={() => selectExistingVideo(video.video_url)}
                                            className="h-10 px-6 bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer"
                                        >
                                            Select
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
