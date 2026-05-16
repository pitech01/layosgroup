import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    X,
    AlertCircle,
    Cloud,
    Upload,
    ArrowLeft,
    Sparkles,
    Monitor,
    Globe,
    Layers,
    Target,
    Zap,
    Loader2,
    Smartphone,
    Activity,
    ShieldCheck,
    Pointer
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

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const BASE_URL = API_URL.replace('/api', '');

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        level: '',
        duration: '',
        language: '',
        thumbnail: ''
    });

    const [cohorts, setCohorts] = useState<Array<{ id: string, name: string, code?: string, type?: string }>>([]);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [modules, setModules] = useState<Module[]>([]);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
    const [uploadingVideos, setUploadingVideos] = useState<{ [lessonId: string]: boolean }>({});
    const [uploadProgress, setUploadProgress] = useState<{ [lessonId: string]: number }>({});
    const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
    const [existingVideos, setExistingVideos] = useState<any[]>([]);
    const [isBrowsingVideos, setIsBrowsingVideos] = useState(false);
    const [browsingLessonContext, setBrowsingLessonContext] = useState<{ moduleId: string; lessonId: string } | null>(null);
    const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
    const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ moduleId: string, lessonIndex: number } | null>(null);

    const handleModuleDragStart = (index: number) => setDraggedModuleIndex(index);
    const handleModuleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedModuleIndex === null || draggedModuleIndex === index) return;
        const newModules = [...modules];
        const draggedItem = newModules[draggedModuleIndex];
        newModules.splice(draggedModuleIndex, 1);
        newModules.splice(index, 0, draggedItem);
        setDraggedModuleIndex(index);
        setModules(newModules);
    };

    const handleLessonDragStart = (moduleId: string, lessonIndex: number) => setDraggedLessonInfo({ moduleId, lessonIndex });
    const handleLessonDragOver = (e: React.DragEvent, targetModuleId: string, targetLessonIndex: number) => {
        e.preventDefault();
        if (!draggedLessonInfo) return;
        const { moduleId: sourceModuleId, lessonIndex: sourceLessonIndex } = draggedLessonInfo;
        if (sourceModuleId === targetModuleId && sourceLessonIndex === targetLessonIndex) return;
        const newModules = [...modules];
        const sourceModule = newModules.find(m => m.id === sourceModuleId);
        const targetModule = newModules.find(m => m.id === targetModuleId);
        if (!sourceModule || !targetModule) return;
        const [draggedLesson] = sourceModule.lessons.splice(sourceLessonIndex, 1);
        targetModule.lessons.splice(targetLessonIndex, 0, draggedLesson);
        setDraggedLessonInfo({ moduleId: targetModuleId, lessonIndex: targetLessonIndex });
        setModules(newModules);
    };

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification((prev: any) => ({ ...prev, show: false })), 4000);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const courseRes = await fetch(`${API_URL}/courses/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (courseRes.ok) {
                    const data = await courseRes.json();
                    setCourseData({
                        title: data.title,
                        description: data.description || '',
                        category: data.category || '',
                        level: data.target_level || '',
                        duration: data.duration || '',
                        language: data.language || '',
                        thumbnail: data.thumbnail ? (data.thumbnail.startsWith('http') ? data.thumbnail : `${BASE_URL}${data.thumbnail}`) : ''
                    });

                    if (data.modules) {
                        setModules(data.modules.map((m: any) => ({
                            id: m.id.toString(),
                            title: m.title,
                            isOpen: false,
                            lessons: m.lessons.map((l: any) => ({
                                id: l.id.toString(),
                                title: l.title,
                                type: l.type,
                                duration: l.duration,
                                description: l.description,
                                isLocked: !!l.is_locked,
                                isPreview: !!l.is_preview,
                                videoUrl: l.video_url ? (l.video_url.startsWith('http') ? l.video_url : `${BASE_URL}/storage/${l.video_url.replace(/^(storage\/|storage\/app\/public\/|public\/storage\/|\/)/, '')}`) : '',
                                videoSource: l.video_source,
                                liveDate: l.live_date,
                                liveTime: l.live_time,
                                livePlatform: l.live_platform,
                                liveLink: l.live_link,
                                fileUrl: l.file_url ? (l.file_url.startsWith('http') ? l.file_url : `${BASE_URL}/storage/${l.file_url.replace(/^(storage\/|storage\/app\/public\/|public\/storage\/|\/)/, '')}`) : '',
                                fileName: l.file_name,
                                quizData: typeof l.quiz_data === 'string' ? JSON.parse(l.quiz_data) : l.quiz_data
                            }))
                        })));
                    }
                    if (data.cohorts?.[0]) setSelectedCohortId(data.cohorts[0].id.toString());
                }

                const cohortsRes = await fetch(`${API_URL}/cohorts`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (cohortsRes.ok) setCohorts(await cohortsRes.json());
            } catch (err) {
                setError("Failed to synchronize with central repository.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
            }
        } else if (currentStep === 4) {
            if (!confirmed) return "You must confirm compliance before finalizing.";
        }
        return null;
    };

    const handleFileUpload = async (moduleId: string, lessonId: string, file: File) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: true }));
        setUploadProgress((prev: any) => ({ ...prev, [lessonId]: 0 }));

        const isVideo = ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(file.name.split('.').pop()?.toLowerCase() || '');

        try {
            let finalUrl = '';
            if (isVideo) {
                const sigResponse = await fetch(`${API_URL}/bunny/generate-signature`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ title: file.name })
                });
                const sigData = await sigResponse.json();
                if (!sigData.success) throw new Error(sigData.message || 'Signature generation failed');
                const { videoId, libraryId, signature, expiration } = sigData;

                finalUrl = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}?authorization=${signature}&expiration=${expiration}`, true);
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    xhr.upload.onprogress = (e) => e.lengthComputable && setUploadProgress((prev: any) => ({ ...prev, [lessonId]: Math.round((e.loaded / e.total) * 100) }));
                    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(`https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`) : reject(`Direct upload failure: ${xhr.status}`);
                    xhr.onerror = () => reject('Network interruption during transmission.');
                    xhr.send(file);
                });
            } else {
                const formData = new FormData();
                formData.append('video', file);
                finalUrl = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', `${API_URL}/upload-video`, true);
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.upload.onprogress = (e) => e.lengthComputable && setUploadProgress((prev: any) => ({ ...prev, [lessonId]: Math.round((e.loaded / e.total) * 100) }));
                    xhr.onload = () => {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) resolve(data.video_url);
                            else reject(data.message || 'Asset upload failed');
                        } catch { reject('Decoding error.'); }
                    };
                    xhr.onerror = () => reject('Network error.');
                    xhr.send(formData);
                });
            }

            const lesson = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
            if (lesson?.type === 'material') updateLesson(moduleId, lessonId, { fileUrl: finalUrl, fileName: file.name });
            else updateLesson(moduleId, lessonId, { videoUrl: finalUrl });
        } catch (err: any) {
            setError(err.message || 'Asset synchronization failed.');
        } finally {
            setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: false }));
        }
    };

    const handleDeleteVideo = async (moduleId: string, lessonId: string, videoUrl: string, type: 'video' | 'file' = 'video') => {
        if (!window.confirm('Are you sure you want to redact this instructional artifact?')) return;
        const token = localStorage.getItem('token');
        try {
            let path = decodeURIComponent(videoUrl).replace(/^\/backend\/storage\//, '').replace(/^\/?storage\//, '').replace(/^\//, '');
            const response = await axios.post(`${API_URL}/remove-media-item`, { path }, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 200) {
                if (type === 'video') updateLesson(moduleId, lessonId, { videoUrl: '' });
                else updateLesson(moduleId, lessonId, { fileUrl: '', fileName: '' });
                showNotification('Artifact redacted successfully.');
            }
        } catch (err: any) {
            setError(err.message || 'Redaction failed.');
        }
    };

    const fetchExistingVideos = async (moduleId: string, lessonId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/course-videos`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                setExistingVideos(await response.json());
                setBrowsingLessonContext({ moduleId, lessonId });
                setIsBrowsingVideos(true);
            }
        } catch (err) {
            showNotification("Failed to synchronize with asset repository.", 'error');
        }
    };

    const selectExistingVideo = (videoUrl: string) => {
        if (browsingLessonContext) {
            updateLesson(browsingLessonContext.moduleId, browsingLessonContext.lessonId, { videoUrl });
            setIsBrowsingVideos(false);
            setBrowsingLessonContext(null);
        }
    };

    const handleUpdateCourse = async (isProgress: boolean = false) => {
        if (!isProgress && validateStep(4)) {
            setError(validateStep(4));
            window.scrollTo(0, 0);
            return;
        }
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const payload = {
                ...courseData,
                target_level: courseData.level,
                cohort_id: selectedCohortId,
                modules: modules.map(m => ({
                    title: m.title,
                    lessons: m.lessons.map(l => ({
                        ...l,
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
            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showNotification(isProgress ? 'Progress synchronized.' : 'Master Blueprint updated successfully.');
                if (!isProgress) setTimeout(() => navigate(`/instructor/course-library`), 1500);
            } else throw new Error('Update synchronization failed.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => setModules([...modules, { id: 'm' + Date.now(), title: `Instructional Phase ${modules.length + 1}`, lessons: [], isOpen: true }]);
    const addLesson = (moduleId: string, type: Lesson['type']) => setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: 'l' + Date.now(), title: `New ${type}`, type, isLocked: false, isPreview: false }] } : m));
    const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) } : m));
    const removeLesson = (moduleId: string, lessonId: string) => window.confirm('Redact this unit?') && setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
    const toggleModule = (id: string) => setModules(modules.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m));
    const removeModule = (id: string) => window.confirm('Redact this phase?') && setModules(modules.filter(m => m.id !== id));
    const updateModuleTitle = (id: string, title: string) => setModules(modules.map(m => m.id === id ? { ...m, title } : m));

    if (loading && step === 1 && !courseData.title) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-6 animate-pulse">
                <Loader2 className="animate-spin text-brand-emerald" size={48} />
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Synchronizing Master Blueprint...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-0 pb-32 space-y-12">
            {/* Header / Breadcrumb */}
            <div className="flex justify-between items-center animate-fade-in-up">
                 <Link to="/instructor/course-library" className="inline-flex items-center gap-3 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.2em] transition-all no-underline group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Repository
                </Link>
                <div className="flex gap-4">
                    <button onClick={() => handleUpdateCourse(true)} className="h-10 px-6 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer">Sync Changes</button>
                    <button onClick={() => navigate(`/instructor/courses/${id}`)} className="h-10 px-6 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer">Preview Interface</button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-8 right-8 z-[2000] px-8 py-5 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-3xl shadow-2xl flex items-center gap-4 animate-slide-in`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.type === 'error' ? 'bg-red-500' : 'bg-brand-emerald'} text-white`}>
                        {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-brand-charcoal dark:text-white">{notification.message}</span>
                </div>
            )}

            {/* Step Wizard */}
            <nav className="flex justify-between items-center relative py-12 px-4 gap-4 overflow-x-auto custom-scrollbar no-scrollbar">
                <div className="absolute top-[4.5rem] left-12 right-12 h-1 bg-brand-beige dark:bg-white/5 rounded-full -z-10"></div>
                {['Metadata', 'Deployment', 'Architecture', 'Revision'].map((label, i) => (
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

            {/* Main Editor Frames */}
            <main className="space-y-16">
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
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Instructional Narrative</label>
                                    <textarea
                                        className="w-full p-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[32px] focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold text-lg min-h-[250px] resize-none"
                                        value={courseData.description}
                                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-5">
                                <div className="p-10 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-xl space-y-8">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] block text-center">Visual Identity</label>
                                    <div 
                                        className="relative group cursor-pointer aspect-video rounded-[32px] overflow-hidden bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed hover:border-brand-emerald transition-all"
                                        onClick={() => document.getElementById('edit-thumb')?.click()}
                                    >
                                        {courseData.thumbnail ? (
                                            <img src={courseData.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-brand-muted">
                                                <UploadCloud size={48} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Select Image Artifact</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <UploadCloud className="text-white" size={40} />
                                        </div>
                                        <input type="file" id="edit-thumb" className="hidden" accept="image/*" onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setCourseData({ ...courseData, thumbnail: ev.target?.result as string });
                                                reader.readAsDataURL(e.target.files[0]);
                                            }
                                        }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Proficiency</label>
                                            <select className="w-full h-12 px-4 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl font-bold text-xs" value={courseData.level} onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Duration</label>
                                            <input type="text" className="w-full h-12 px-4 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl font-bold text-xs" value={courseData.duration} onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })} placeholder="e.g. 12 Weeks" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-8 md:p-16 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-brand-emerald/10 rounded-2xl">
                                <Globe className="text-brand-emerald" size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Deployment Strategy</h2>
                        </div>
                        <p className="text-brand-muted font-medium text-lg mb-10">Modify the operational cohort synchronization for this master artifact.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cohorts.map((cohort) => (
                                <button
                                    key={cohort.id}
                                    onClick={() => setSelectedCohortId(cohort.id)}
                                    className={`p-10 rounded-[32px] border-2 transition-all text-left flex justify-between items-center group border-none cursor-pointer ${selectedCohortId === cohort.id ? 'bg-brand-emerald border-brand-emerald shadow-2xl shadow-brand-emerald/20' : 'bg-brand-beige/20 dark:bg-white/5 border-brand-border hover:border-brand-emerald/50'}`}
                                >
                                    <div className="space-y-2">
                                        <h4 className={`text-xl font-black uppercase tracking-tight ${selectedCohortId === cohort.id ? 'text-white' : 'text-brand-charcoal dark:text-white'}`}>{cohort.name}</h4>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${selectedCohortId === cohort.id ? 'text-white/70' : 'text-brand-muted'}`}>ID: {cohort.id}</div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedCohortId === cohort.id ? 'bg-white text-brand-emerald' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'}`}><Target size={24} /></div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-12 animate-fade-in-up">
                         <div className="bg-white dark:bg-brand-charcoal rounded-[48px] border border-brand-border p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-brand-charcoal/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-emerald/10 rounded-2xl">
                                    <Layers className="text-brand-emerald" size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Curriculum Architecture</h2>
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Reorder & modify instructional modules</p>
                                </div>
                            </div>
                            <button onClick={addModule} className="h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"><Plus size={20} /> Add Phase</button>
                        </div>

                        <div className="space-y-8">
                            {modules.map((mod, modIdx) => (
                                <div 
                                    key={mod.id} 
                                    draggable
                                    onDragStart={() => handleModuleDragStart(modIdx)}
                                    onDragOver={(e) => handleModuleDragOver(e, modIdx)}
                                    className={`bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden transition-all duration-500 ${mod.isOpen ? 'shadow-2xl shadow-brand-charcoal/5 ring-1 ring-brand-emerald/20' : 'shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-6 p-8 md:p-10 cursor-pointer select-none" onClick={() => toggleModule(mod.id)}>
                                        <div className="w-12 h-12 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center text-brand-muted shrink-0 cursor-grab active:cursor-grabbing"><GripVertical size={24} /></div>
                                        <div className="flex-1"><input className="w-full bg-transparent border-none text-xl md:text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight focus:outline-none focus:text-brand-emerald" value={mod.title} onChange={(e) => updateModuleTitle(mod.id, e.target.value)} onClick={(e) => e.stopPropagation()} /></div>
                                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => removeModule(mod.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"><Trash2 size={18} /></button>
                                            <div className={`w-10 h-10 flex items-center justify-center bg-brand-beige dark:bg-white/5 border border-brand-border rounded-xl text-brand-muted transition-transform duration-500 ${mod.isOpen ? 'rotate-180' : ''}`}><ChevronDown size={24} /></div>
                                        </div>
                                    </div>

                                    {mod.isOpen && (
                                        <div className="px-8 md:px-10 pb-10 space-y-6 animate-fade-in-up">
                                            <div className="border-t border-brand-border pt-10 grid grid-cols-1 gap-4">
                                                {mod.lessons.map((lesson, lIdx) => (
                                                    <div 
                                                        key={lesson.id} 
                                                        draggable
                                                        onDragStart={() => handleLessonDragStart(mod.id, lIdx)}
                                                        onDragOver={(e) => handleLessonDragOver(e, mod.id, lIdx)}
                                                        className="flex flex-col gap-0"
                                                    >
                                                        <div className={`flex items-center justify-between p-6 bg-white dark:bg-brand-charcoal border border-brand-border transition-all duration-300 ${editingLessonId === lesson.id ? 'rounded-t-[28px] border-brand-emerald shadow-xl' : 'rounded-[28px] hover:shadow-xl hover:shadow-brand-charcoal/5'}`}>
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${lesson.type === 'video' ? 'bg-blue-500/10 text-blue-600' : lesson.type === 'live' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                                    {lesson.type === 'video' && <Video size={20} />}
                                                                    {lesson.type === 'live' && <Activity size={20} />}
                                                                    {lesson.type === 'material' && <FileText size={20} />}
                                                                    {lesson.type === 'quiz' && <ShieldCheck size={20} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h5 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{lesson.title}</h5>
                                                                    <div className="text-[8px] font-black text-brand-muted uppercase tracking-widest">{lesson.type} {lesson.isPreview && <span className="text-brand-emerald">• Preview Active</span>}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)} className={`h-10 px-4 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${editingLessonId === lesson.id ? 'bg-brand-charcoal text-white' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'}`}><Edit2 size={14} /> {editingLessonId === lesson.id ? 'Close' : 'Modify'}</button>
                                                                <button onClick={() => removeLesson(mod.id, lesson.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"><Trash2 size={18} /></button>
                                                            </div>
                                                        </div>

                                                        {editingLessonId === lesson.id && (
                                                            <div className="p-8 md:p-12 bg-brand-beige/20 dark:bg-white/5 border-x border-b border-brand-emerald/30 rounded-b-[28px] space-y-10 animate-fade-in-up">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Unit Identifier</label>
                                                                        <input type="text" className="w-full h-14 px-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-xl font-bold" value={lesson.title} onChange={(e) => updateLesson(mod.id, lesson.id, { title: e.target.value })} />
                                                                    </div>
                                                                    <div className="flex gap-4 items-end">
                                                                        <button onClick={() => updateLesson(mod.id, lesson.id, { isPreview: !lesson.isPreview })} className={`flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${lesson.isPreview ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}><Eye size={18} /> Preview</button>
                                                                        <button onClick={() => updateLesson(mod.id, lesson.id, { isLocked: !lesson.isLocked })} className={`flex-1 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${lesson.isLocked ? 'bg-brand-charcoal text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}><Lock size={18} /> Lock</button>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-6">
                                                                    {lesson.type === 'video' && (
                                                                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed rounded-[32px] gap-6">
                                                                            {uploadingVideos[lesson.id] ? (
                                                                                <div className="w-full max-w-xs space-y-4">
                                                                                    <Loader2 className="animate-spin text-brand-emerald mx-auto" size={40} />
                                                                                    <div className="h-2 bg-brand-beige dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-brand-emerald transition-all" style={{ width: `${uploadProgress[lesson.id]}%` }}></div></div>
                                                                                </div>
                                                                            ) : lesson.videoUrl ? (
                                                                                <div className="flex flex-col items-center gap-4">
                                                                                    <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl"><CheckCircle2 size={32} /></div>
                                                                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest truncate max-w-md">{lesson.videoUrl}</p>
                                                                                    <button onClick={() => handleDeleteVideo(mod.id, lesson.id, lesson.videoUrl!)} className="h-10 px-6 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">Redact</button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex gap-4">
                                                                                    <button onClick={() => document.getElementById(`v-up-${lesson.id}`)?.click()} className="h-12 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase tracking-widest border-none cursor-pointer">Local Asset</button>
                                                                                    <button onClick={() => fetchExistingVideos(mod.id, lesson.id)} className="h-12 px-8 bg-brand-beige dark:bg-white/10 text-brand-muted rounded-xl font-black text-[10px] uppercase tracking-widest border-none cursor-pointer">Library</button>
                                                                                </div>
                                                                            )}
                                                                            <input id={`v-up-${lesson.id}`} type="file" className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(mod.id, lesson.id, e.target.files[0])} />
                                                                        </div>
                                                                    )}
                                                                    {lesson.type === 'live' && (
                                                                        <div className="grid grid-cols-2 gap-6">
                                                                            <input type="date" className="h-14 px-6 bg-white border border-brand-border rounded-xl font-bold" value={lesson.liveDate} onChange={(e) => updateLesson(mod.id, lesson.id, { liveDate: e.target.value })} />
                                                                            <input type="text" className="h-14 px-6 bg-white border border-brand-border rounded-xl font-bold" value={lesson.liveLink} onChange={(e) => updateLesson(mod.id, lesson.id, { liveLink: e.target.value })} placeholder="Session Link" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                                {['video', 'live', 'material', 'quiz'].map(tp => (
                                                    <button key={tp} onClick={() => addLesson(mod.id, tp as any)} className="h-14 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border border-dashed rounded-2xl flex items-center justify-center gap-3 text-brand-muted hover:text-brand-emerald hover:border-brand-emerald transition-all border-none cursor-pointer">
                                                        <Plus size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">{tp}</span>
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

                {step === 4 && (
                    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
                        <div className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-20 shadow-2xl text-center space-y-12">
                             <div className="w-24 h-24 bg-brand-emerald text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-emerald/30 animate-bounce">
                                <Sparkles size={48} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Revision Complete</h2>
                                <p className="text-brand-muted font-medium text-lg leading-relaxed">The master artifact is ready for synchronization. Confirm to finalize all modifications.</p>
                            </div>
                            <div className="flex items-center justify-center gap-4 p-8 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-border">
                                <button onClick={() => setConfirmed(!confirmed)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${confirmed ? 'bg-brand-emerald text-white' : 'bg-white dark:bg-brand-charcoal border-2 border-brand-border text-brand-muted'}`}>{confirmed && <CheckCircle2 size={20} />}</button>
                                <span className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-widest">Verify Technical Compliance</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Actions Bar */}
            <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-brand-charcoal/90 dark:bg-brand-emerald/90 backdrop-blur-2xl px-10 py-6 rounded-[32px] flex justify-between items-center z-[100] shadow-2xl border border-white/10 animate-fade-in-up">
                <button onClick={() => step > 1 ? setStep(step - 1) : null} className={`h-14 px-8 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all border-none cursor-pointer ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}><ChevronLeft size={20} /> Back</button>
                <div className="flex gap-4 items-center">
                    <span className="hidden md:block text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Step {step} of 4</span>
                    {step < 4 ? (
                        <button onClick={() => setStep(step + 1)} className="h-14 px-12 bg-white text-brand-charcoal rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all border-none cursor-pointer">Continue <ChevronRight size={20} /></button>
                    ) : (
                        <button onClick={() => handleUpdateCourse()} disabled={!confirmed || loading} className="h-14 px-12 bg-brand-emerald dark:bg-white text-white dark:text-brand-emerald rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 disabled:opacity-50 transition-all border-none cursor-pointer">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Finalize Synchronize
                        </button>
                    )}
                </div>
            </footer>

            {/* Asset Browser Modal */}
            {isBrowsingVideos && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsBrowsingVideos(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-full bg-white dark:bg-brand-charcoal rounded-[60px] shadow-2xl overflow-y-auto custom-scrollbar animate-scale-up p-16">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Artifact Repository</h3>
                            <button onClick={() => setIsBrowsingVideos(false)} className="w-12 h-12 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-red-500 rounded-full flex items-center justify-center transition-all border-none cursor-pointer"><X size={24} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {existingVideos.map((v, i) => (
                                <div key={i} className="p-6 bg-brand-beige/20 dark:bg-white/5 border border-brand-border rounded-3xl flex justify-between items-center group hover:border-brand-emerald transition-all">
                                    <div className="space-y-1 flex-1 overflow-hidden"><h5 className="text-sm font-black text-brand-charcoal dark:text-white uppercase truncate">{v.title || 'Artifact'}</h5><p className="text-[10px] font-bold text-brand-muted truncate">{v.video_url}</p></div>
                                    <button onClick={() => selectExistingVideo(v.video_url)} className="h-10 px-6 bg-brand-emerald text-white rounded-xl font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border-none cursor-pointer">Select</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
