import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
    ChevronRight,
    AlertCircle,
    Cloud,
    Upload,
    CloudOff
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
    const [previewAsset, setPreviewAsset] = useState<{ url: string; type: 'image' | 'pdf' } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [isMaximized, setIsMaximized] = useState(false);
    const [designingQuiz, setDesigningQuiz] = useState<{ moduleId: string; lessonId: string } | null>(null);
    const [viewingQuizKey, setViewingQuizKey] = useState<{ moduleId: string; lessonId: string } | null>(null);
    const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
    const [existingVideos, setExistingVideos] = useState<any[]>([]);
    const [isBrowsingVideos, setIsBrowsingVideos] = useState(false);
    const [browsingLessonContext, setBrowsingLessonContext] = useState<{ moduleId: string; lessonId: string } | null>(null);
    const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
    const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ moduleId: string, lessonIndex: number } | null>(null);

    const handleModuleDragStart = (index: number) => {
        setDraggedModuleIndex(index);
    };

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

    const handleLessonDragStart = (moduleId: string, lessonIndex: number) => {
        setDraggedLessonInfo({ moduleId, lessonIndex });
    };

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
                // Fetch Course
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
                                videoUrl: l.video_url ? (
                                    l.video_url.startsWith('http') 
                                        ? l.video_url 
                                        : `${BASE_URL}/storage/${l.video_url.replace(/^(storage\/|storage\/app\/public\/|public\/storage\/|\/)/, '')}`
                                ) : '',
                                videoSource: l.video_source,
                                liveDate: l.live_date,
                                liveTime: l.live_time,
                                livePlatform: l.live_platform,
                                liveLink: l.live_link,
                                fileUrl: l.file_url ? (
                                    l.file_url.startsWith('http') 
                                        ? l.file_url 
                                        : `${BASE_URL}/storage/${l.file_url.replace(/^(storage\/|storage\/app\/public\/|public\/storage\/|\/)/, '')}`
                                ) : '',
                                fileName: l.file_name,
                                quizData: typeof l.quiz_data === 'string' ? JSON.parse(l.quiz_data) : l.quiz_data
                            }))
                        })));
                    }

                    if (data.cohorts && data.cohorts.length > 0) {
                        setSelectedCohortId(data.cohorts[0].id.toString());
                    }
                }

                // Fetch Cohorts
                const cohortsRes = await fetch(`${API_URL}/cohorts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (cohortsRes.ok) {
                    const cohortsData = await cohortsRes.json();
                    setCohorts(cohortsData);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load details.");
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

    const handleFileUpload = async (moduleId: string, lessonId: string, file: File) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: true }));
        setUploadProgress((prev: any) => ({ ...prev, [lessonId]: 0 }));

        const isVideo = ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(file.name.split('.').pop()?.toLowerCase() || '');

        try {
            let finalUrl = '';

            if (isVideo) {
                // 1. Get Signature from Backend
                const sigResponse = await fetch(`${API_URL}/bunny/generate-signature`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ title: file.name })
                });

                const sigData = await sigResponse.json();
                if (!sigData.success) throw new Error(sigData.message || 'Failed to prepare secure upload');

                const { videoId, libraryId, signature, expiration } = sigData;

                // 2. Direct Upload to Bunny Stream
                finalUrl = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const bunnyUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}?authorization=${signature}&expiration=${expiration}`;
                    
                    xhr.open('PUT', bunnyUrl, true);
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            setUploadProgress((prev: any) => ({ ...prev, [lessonId]: percent }));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(`https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`);
                        } else {
                            const errorMsg = `Bunny Upload failed (Status: ${xhr.status}). ${xhr.responseText || ''}`;
                            console.error(errorMsg);
                            reject(errorMsg);
                        }
                    };

                    xhr.onerror = () => {
                        const errorMsg = 'Network or CORS error during direct upload to Bunny.net. Please ensure your domain is allowed in the Bunny Stream dashboard.';
                        console.error(errorMsg);
                        reject(errorMsg);
                    };
                    xhr.send(file);
                });
            } else {
                // Traditional Upload for Documents
                const formData = new FormData();
                formData.append('video', file);

                finalUrl = await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', `${API_URL}/upload-video`, true);
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            setUploadProgress((prev: any) => ({ ...prev, [lessonId]: percent }));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                if (data.success) resolve(data.video_url);
                                else reject(data.message || 'Upload failed');
                            } catch { reject('Error parsing response.'); }
                        } else {
                            try {
                                const errorData = JSON.parse(xhr.responseText);
                                reject(errorData.message || `Upload failed: ${xhr.status}`);
                            } catch { reject(`Upload failed: ${xhr.status}`); }
                        }
                    };

                    xhr.onerror = () => reject('Network error.');
                    xhr.send(formData);
                });
            }

            // Update Lesson Data
            const lesson = modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
            if (lesson?.type === 'material') {
                updateLesson(moduleId, lessonId, { fileUrl: finalUrl, fileName: file.name, fileToUpload: undefined });
            } else {
                updateLesson(moduleId, lessonId, { videoUrl: finalUrl, videoToUpload: undefined, fileToUpload: undefined });
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploadingVideos((prev: any) => ({ ...prev, [lessonId]: false }));
        }
    };

    const handleDeleteVideo = async (moduleId: string, lessonId: string, videoUrl: string, type: 'video' | 'file' = 'video') => {
        if (!window.confirm('Delete this file permanently from storage?')) return;

        const token = localStorage.getItem('token');

        try {
            // Extract the relative path
            let extractedPath = videoUrl;
            try {
                const urlObj = new URL(videoUrl);
                extractedPath = urlObj.pathname;
            } catch (e) {
                // Ignore if it's not a full URL
            }
            
            // Normalize path: decode and remove '/storage/' or leading slashes
            extractedPath = decodeURIComponent(extractedPath);
            extractedPath = extractedPath.replace(/^\/backend\/storage\//, '')
                                         .replace(/^\/?storage\//, '')
                                         .replace(/^\//, ''); // remove remaining leading slash

            console.log("Deleting:", extractedPath);
            
            const response = await axios.post(`${API_URL}/remove-media-item`, {
                path: extractedPath
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log("File successfully deleted.");
                if (type === 'video') {
                    updateLesson(moduleId, lessonId, { videoUrl: '' });
                } else {
                    updateLesson(moduleId, lessonId, { fileUrl: '', fileName: '' });
                }
                showNotification('File deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete file');
            }
        } catch (err: any) {
            console.error("Delete asset error:", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Deletion failed';
            setError(errorMsg);
            showNotification(errorMsg, 'error');
        }
    };

    const fetchExistingVideos = async (moduleId: string, lessonId: string) => {
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
            console.error("Failed to fetch videos:", err);
            showNotification("Failed to load existing videos.", 'error');
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
        // Validation: If it's the final update, validate everything. 
        // If it's just saving progress, at least require the title if they changed it, 
        // but generally we can allow partial saves.
        if (!isProgress) {
            const errorMsg = validateStep(4); // Final validation
            if (errorMsg) {
                setError(errorMsg);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        } else {
            if (!courseData.title.trim()) {
                setError("Course title is required to save progress.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        setLoading(true);
        setError(null);


        const token = localStorage.getItem('token');


        try {
            // Pending file uploads are now handled immediately upon selection
            const updatedModules = [...modules];
            setModules(updatedModules);


            // API CALL
            const payload: any = {
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                target_level: courseData.level,
                duration: courseData.duration,
                language: courseData.language,
                thumbnail: courseData.thumbnail,
                cohort_id: selectedCohortId,
                modules: updatedModules.map((m: any) => ({
                    title: m.title,
                    lessons: m.lessons.map((l: any) => ({
                        title: l.title,
                        type: l.type,
                        duration: l.duration,
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

            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (isProgress) {
                    showNotification('Changes synchronized successfully with the cloud.', 'success');
                } else {
                    showNotification('Master Course Blueprint updated successfully!', 'success');
                    setTimeout(() => navigate(`/instructor/course-library`), 1500);
                }
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update course');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during update.');
            showNotification(err.message || 'Update synchronization failed.', 'error');
        } finally {
            setLoading(false);
        }
    };


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
        setModules(modules.map((mod: any) => {
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

    const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
        setModules(modules.map((m: Module) => {
            if (m.id === moduleId) {
                return {
                    ...m,
                    lessons: m.lessons.map((l: Lesson) => l.id === lessonId ? { ...l, ...updates } : l)
                };
            }
            return m;
        }));
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        if (window.confirm('Delete this lesson?')) {
            setModules(modules.map((m: Module) => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        lessons: m.lessons.filter((l: Lesson) => l.id !== lessonId)
                    };
                }
                return m;
            }));
        }
    };

    const toggleModule = (id: string) => {
        setModules(modules.map((m: Module) => m.id === id ? { ...m, isOpen: !m.isOpen } : m));
    };

    const removeModule = (id: string) => {
        if (window.confirm('Are you sure you want to remove this module and all its contents?')) {
            setModules(modules.filter((m: Module) => m.id !== id));
        }
    };

    const updateModuleTitle = (id: string, title: string) => {
        setModules(modules.map((m: Module) => m.id === id ? { ...m, title } : m));
    };

    return (
        <div className="create-course-system">
            <style>{`
                .create-course-system {
                    max-width: 1240px;
                    margin: 0 auto;
                    padding-bottom: 8rem;
                }

                @media (max-width: 768px) {
                    .create-course-system {
                        padding-bottom: 4rem;
                    }
                }
                
                .responsive-two-col {
                    display: grid;
                    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
                    gap: 4.5rem;
                }
                
                @media (max-width: 1024px) {
                    .responsive-two-col {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }

                @media (max-width: 768px) {
                    .responsive-two-col {
                        gap: 1.5rem;
                    }
                }

                .step-indicator-bar {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5rem;
                    position: relative;
                    padding: 0 1rem;
                }

                @media (max-width: 768px) {
                    .step-indicator-bar {
                        margin-bottom: 3rem;
                        gap: 0.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .step-indicator-bar {
                        overflow-x: auto;
                        padding-bottom: 1rem;
                        justify-content: flex-start;
                        scrollbar-width: none;
                    }
                    .step-indicator-bar::-webkit-scrollbar { display: none; }
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

                @media (max-width: 768px) {
                    .step-circle {
                        width: 42px;
                        height: 42px;
                        border-radius: 12px;
                        font-size: 0.85rem;
                    }
                }

                .step-item.active .step-circle {
                    border-color: #1a4d3e;
                    background: linear-gradient(135deg, #1a4d3e, #0f172a);
                    color: white;
                    transform: scale(1.15) translateY(-4px);
                    box-shadow: 0 15px 25px -5px rgba(26, 77, 62, 0.25);
                }

                .step-item.completed .step-circle {
                    border-color: #1a4d3e;
                    background: #f0fdf4;
                    color: #1a4d3e;
                }

                .step-label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    transition: all 0.3s;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .step-label {
                        font-size: 0.65rem;
                        letter-spacing: 0.05em;
                    }
                }
                
                @media (max-width: 640px) {
                    .step-item {
                        min-width: 100px;
                    }
                }

                .step-item.active .step-label { 
                    color: #1a4d3e; 
                    transform: translateY(-2px);
                }

                .form-section-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.7);
                    border-radius: 32px;
                    padding: 4rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.03), 0 15px 20px -5px rgba(0,0,0,0.02);
                }

                @media (max-width: 768px) {
                    .form-section-card {
                        padding: 2rem 1.5rem;
                        border-radius: 24px;
                    }
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
                    border-color: #1a4d3e;
                    background: white;
                    box-shadow: 0 0 0 5px rgba(26, 77, 62, 0.06);
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

                @media (max-width: 768px) {
                    .module-header {
                        padding: 1.25rem 1.5rem;
                        gap: 1rem;
                    }
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

                @media (max-width: 768px) {
                    .lesson-card {
                        padding: 1.25rem 1.5rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.25rem;
                    }
                    .lesson-card > div:last-child {
                        width: 100%;
                        justify-content: flex-end;
                    }
                }

                .lesson-card:hover {
                    background: #fcfdfe;
                    transform: translateX(6px);
                }

                @media (max-width: 768px) {
                    .lesson-card:hover { transform: none; }
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
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .add-lesson-bar {
                        padding: 1.5rem;
                        gap: 0.75rem;
                    }
                    .type-btn {
                        padding: 0.6rem 1rem;
                        font-size: 0.75rem;
                        flex: 1 1 40%;
                        justify-content: center;
                    }
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
                    border-color: #1a4d3e;
                    color: #1a4d3e;
                    background: white;
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 10px 20px -5px rgba(26, 77, 62, 0.15);
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

                @media (max-width: 768px) {
                    .sticky-actions-bar {
                        bottom: 1rem;
                        padding: 1rem 1.5rem;
                        border-radius: 20px;
                        width: 95%;
                    }
                    .btn-standard {
                        padding: 0 1.25rem;
                        font-size: 0.85rem;
                        height: 46px;
                    }
                }
                
                @media (max-width: 480px) {
                    .btn-save-progress span {
                        display: inline !important;
                        font-size: 0.75rem;
                    }
                    .btn-save-progress {
                        padding: 0 0.75rem !important;
                        height: 44px !important;
                        border-radius: 12px !important;
                        min-width: unset !important;
                        width: auto !important;
                    }
                    .btn-next-step {
                        padding: 0 1rem !important;
                        height: 44px !important;
                        gap: 6px !important;
                        font-size: 0.8rem !important;
                        min-width: 110px !important;
                        border-radius: 12px !important;
                    }
                    .sticky-actions-bar {
                        padding: 1rem !important;
                        gap: 1rem !important;
                        justify-content: center !important;
                        position: fixed !important;
                        bottom: 1.5rem !important;
                        width: calc(100% - 2rem) !important;
                        left: 1rem !important;
                        transform: none !important;
                    }
                    .back-btn-container {
                        position: static !important;
                    }
                    .sticky-actions-bar > div:nth-child(2) {
                        flex: 1;
                        justify-content: center !important;
                        gap: 0.75rem !important;
                    }
                    .hide-mobile {
                        display: none !important;
                    }
                    .btn-save-progress span {
                        display: inline;
                        font-size: 0.8rem;
                    }
                    .btn-save-progress {
                        padding: 0 1rem !important;
                        gap: 0.5rem !important;
                    }
                    .btn-next-step {
                        padding: 0 1.25rem !important;
                        flex: 1;
                        max-width: 180px;
                        font-size: 0.85rem !important;
                    }
                    .btn-next-step span {
                        font-size: 0.85rem;
                    }
                }

                .hide-mobile {
                    display: inline;
                }

                .btn-save-progress {
                    background: white !important;
                    border: 1.5px solid #e2e8f0 !important;
                    color: #64748b !important;
                    font-weight: 800 !important;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-next-step {
                    background: #1a4d3e !important;
                    color: white !important;
                    padding: 0 3rem;
                    height: 60px;
                    border-radius: 18px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 20px -5px rgba(26, 77, 62, 0.3);
                }

                @media (max-width: 768px) {
                    .btn-next-step {
                        padding: 0 2rem;
                        height: 52px;
                        border-radius: 14px;
                        gap: 10px;
                    }
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

                .cohort-mode-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }
                .mode-card {
                    padding: 2.5rem;
                    border-radius: 28px;
                    border: 2.5px solid #f1f5f9;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: center;
                }
                .mode-card.selected {
                    border-color: #1a4d3e;
                    background: #f0fdf4;
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(26, 77, 62, 0.1);
                }
                .mode-card h4 { margin: 16px 0 8px 0; font-weight: 900; color: #0f172a; }
                .mode-card p { font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.5; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .hover-danger:hover { background: #fef2f2 !important; color: #ef4444 !important; }
                .thumbnail-wrapper:hover .thumbnail-overlay { opacity: 1; }
                .thumbnail-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(4px);
                }
            `}</style>

            {/* Step Wizard Header */}
            <div className="step-indicator-bar">
                {['Course Details', 'Target Cohort', 'Curriculum Builder', 'Review & Publish'].map((label, i) => (
                    <div key={i} className={`step-item ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {step > i + 1 ? <CheckCircle2 size={24} /> : i + 1}
                        </div>
                        <span className="step-label">{label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="animate-slide-in" style={{
                    maxWidth: '1240px',
                    margin: '-3rem auto 3rem auto',
                    padding: '1rem 1.25rem',
                    background: '#fff1f2',
                    border: '1px solid #ffe4e6',
                    color: '#e11d48',
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <AlertCircle size={20} strokeWidth={2.5} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Step 1: Academic Identity (formerly Step 2 content) */}
            {step === 1 && (
                <div className="form-section-card animate-fade-in-up">
                    <h3 className="section-title">
                        <Layout size={32} color="#020617" style={{ background: 'rgba(2, 6, 23, 0.08)', padding: '8px', borderRadius: '14px' }} />
                        Update Course Foundations
                    </h3>

                    <div className="responsive-two-col">
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div>
                                    <label className="input-label">Course Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={courseData.title}
                                        onChange={(e: any) => setCourseData({ ...courseData, title: e.target.value })}
                                        placeholder="Enter the title of your course..."
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Core Description</label>
                                    <textarea
                                        className="custom-input"
                                        rows={6}
                                        value={courseData.description}
                                        onChange={(e: any) => setCourseData({ ...courseData, description: e.target.value })}
                                        placeholder="Summarize the learning transformation students will experience..."
                                        style={{ resize: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Primary Content Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                        {[
                                            { id: 'video', label: 'Video Lessons', icon: Video, color: '#1d4ed8' },
                                            { id: 'live', label: 'Live Sessions', icon: Users, color: '#b91c1c' },
                                            { id: 'material', label: 'Document Hub', icon: FileText, color: '#065f46' },
                                            { id: 'quiz', label: 'Evaluations', icon: HelpCircle, color: '#9a3412' }
                                        ].map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => setCourseData({ ...courseData, category: cat.id })}
                                                style={{
                                                    padding: '1.25rem',
                                                    borderRadius: '18px',
                                                    border: courseData.category === cat.id ? `2px solid ${cat.color}` : '2px solid #f1f5f9',
                                                    background: courseData.category === cat.id ? `${cat.color}05` : 'white',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <cat.icon size={24} color={courseData.category === cat.id ? cat.color : '#94a3b8'} style={{ marginBottom: '8px' }} />
                                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: courseData.category === cat.id ? cat.color : '#64748b', textTransform: 'uppercase' }}>{cat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>




                        </div>

                        <div className="blueprint-meta-sidebar" style={{ background: '#f8fafc', padding: '3rem', borderRadius: '24px', border: '1.5px solid #f1f5f9' }}>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div
                                    className="thumbnail-wrapper"
                                    style={{
                                        textAlign: 'center',
                                        height: '240px',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2.5px dashed #cbd5e1',
                                        borderRadius: '24px',
                                        background: 'white',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                >
                                    {courseData.thumbnail ? (
                                        <div style={{ position: 'absolute', inset: 0 }}>
                                            <img
                                                src={courseData.thumbnail}
                                                alt="Thumbnail preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }}
                                                onContextMenu={(e: any) => e.preventDefault()}
                                            />
                                            <div className="thumbnail-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'auto' }}>
                                                <p style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>Change Image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud size={32} color="#94a3b8" />
                                            <p style={{ margin: '1rem 0 0 0', fontWeight: 800, color: '#64748b', fontSize: '0.85rem' }}>UPLOAD COURSE THUMBNAIL</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="thumbnail-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setCourseData({ ...courseData, thumbnail: event.target?.result as string });
                                            };
                                            reader.readAsDataURL(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Operational Deployment (Select Cohort) */}
            {step === 2 && (
                <div className="form-section-card animate-fade-in-up">
                    <h3 className="section-title">
                        <Users size={32} color="#1a4d3e" style={{ background: '#f0fdf4', padding: '8px', borderRadius: '14px' }} />
                        Target Cohort Assignment
                    </h3>

                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600, marginBottom: '2.5rem' }}>Select the cohort you want to assign this course curriculum to.</p>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {cohorts.length > 0 ? (
                            cohorts.map((cohort: { id: string; name: string; code?: string; type?: string }) => (
                                <div
                                    key={cohort.id}
                                    onClick={() => setSelectedCohortId(cohort.id)}
                                    style={{
                                        padding: '2rem',
                                        border: selectedCohortId === cohort.id ? '2px solid #1a4d3e' : '2px solid #f1f5f9',
                                        background: selectedCohortId === cohort.id ? '#f0fdf4' : 'white',
                                        borderRadius: '24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedCohortId === cohort.id ? '0 10px 15px -3px rgba(26, 77, 62, 0.1)' : 'none'
                                    }}
                                    className="hover-premium"
                                >
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{cohort.name}</h4>
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800 }}>CODE: {cohort.code || 'N/A'} • {cohort.type || 'Standard Track'}</span>
                                    </div>
                                    <button
                                        className="btn-standard"
                                        style={{
                                            background: selectedCohortId === cohort.id ? '#1a4d3e' : '#f8fafc',
                                            border: '1.5px solid #e2e8f0',
                                            color: selectedCohortId === cohort.id ? 'white' : '#1a4d3e',
                                            fontWeight: 800
                                        }}
                                    >
                                        {selectedCohortId === cohort.id ? 'Assigned' : 'Select Target'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '1.5px dashed #e2e8f0' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#64748b' }}>No active cohorts found. Please create one first.</p>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '2rem', background: '#f8fafc', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Plus size={20} color="#64748b" />
                        <span style={{ fontWeight: 800, color: '#64748b' }}>Or save to Course Library without deploying.</span>
                    </div>
                </div>
            )
            }

            {/* Step 3: Curriculum Architecture */}
            {step === 3 && (
                <div className="form-section-card animate-fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>
                                <BookOpen size={32} color="#020617" style={{ background: 'rgba(2, 6, 23, 0.08)', padding: '8px', borderRadius: '14px' }} />
                                Course Curriculum
                            </h3>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Design the learning path with modules and lessons.</p>
                        </div>
                        <button onClick={addModule} className="btn-standard" style={{ background: '#020617', padding: '0 2rem', boxShadow: '0 10px 15px -3px rgba(2, 6, 23, 0.2)' }}>
                            <Plus size={20} /> New Module
                        </button>
                    </div>

                    <div className="curriculum-container">
                        {modules.map((mod, modIdx) => (
                            <div 
                                key={mod.id} 
                                className={`curriculum-module ${draggedModuleIndex === modIdx ? 'dragging' : ''}`}
                                draggable={true}
                                onDragStart={() => handleModuleDragStart(modIdx)}
                                onDragOver={(e) => handleModuleDragOver(e, modIdx)}
                                onDragEnd={() => setDraggedModuleIndex(null)}
                            >
                                <div className="module-header" onClick={() => toggleModule(mod.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                        <GripVertical size={20} color="#cbd5e1" style={{ cursor: 'grab' }} />
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1.5px solid #e2e8f0', color: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                            {modIdx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="module-title-inline-input"
                                            value={mod.title}
                                            onChange={(e: any) => updateModuleTitle(mod.id, e.target.value)}
                                            onClick={(e: any) => e.stopPropagation()}
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
                                        {mod.lessons.map((lesson, lessonIdx) => (
                                            <div 
                                                key={lesson.id} 
                                                style={{ marginBottom: '0.25rem' }}
                                                className={`lesson-drag-container ${draggedLessonInfo?.moduleId === mod.id && draggedLessonInfo?.lessonIndex === lessonIdx ? 'dragging' : ''}`}
                                                draggable={true}
                                                onDragStart={(e) => {
                                                    e.stopPropagation();
                                                    handleLessonDragStart(mod.id, lessonIdx);
                                                }}
                                                onDragOver={(e) => {
                                                    e.stopPropagation();
                                                    handleLessonDragOver(e, mod.id, lessonIdx);
                                                }}
                                                onDragEnd={() => setDraggedLessonInfo(null)}
                                            >
                                                <div className="lesson-card">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                        <GripVertical size={20} color="#cbd5e1" style={{ cursor: 'grab' }} />
                                                        <div className={`lesson-type-badge type-${lesson.type}`}>
                                                            {lesson.type === 'video' && <Video size={14} />}
                                                            {lesson.type === 'live' && <Users size={14} />}
                                                            {lesson.type === 'material' && <FileText size={14} />}
                                                            {lesson.type === 'quiz' && <HelpCircle size={14} />}
                                                            {lesson.type === 'material' ? 'Docs' : lesson.type === 'quiz' ? 'Evaluation' : lesson.type === 'live' ? 'Live Class' : 'Video'}
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


                                                            <div>
                                                                <label className="input-label">Session Description</label>
                                                                <textarea
                                                                    className="custom-input"
                                                                    style={{ minHeight: '120px', resize: 'vertical', paddingTop: '1rem' }}
                                                                    value={lesson.description || ''}
                                                                    onChange={(e) => updateLesson(mod.id, lesson.id, { description: e.target.value })}
                                                                    placeholder="Provide a detailed overview of what students will learn in this session..."
                                                                />
                                                            </div>

                                                            {lesson.type === 'video' && (
                                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                                    <div
                                                                        style={{ padding: '3rem', border: '2.5px dashed #cbd5e1', borderRadius: '20px', textAlign: 'center', background: 'white', cursor: uploadingVideos[lesson.id] ? 'not-allowed' : 'pointer', position: 'relative' }}
                                                                        onClick={() => {
                                                                            if (!uploadingVideos[lesson.id] && !lesson.videoUrl) {
                                                                                document.getElementById(`video-upload-${lesson.id}`)?.click();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {uploadingVideos[lesson.id] ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#f8fafc', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                                                                    <UploadCloud size={32} color="#1a4d3e" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#1a4d3e' }}>Uploading... {uploadProgress[lesson.id] || 0}%</h5>
                                                                                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
                                                                                    <div style={{ width: `${uploadProgress[lesson.id] || 0}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }}></div>
                                                                                </div>
                                                                            </div>
                                                                        ) : lesson.fileToUpload ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#fffbeb', marginBottom: '1rem', border: '1.5px dashed #f59e0b' }}>
                                                                                    <Clock size={32} color="#f59e0b" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#f59e0b' }}>Pending Upload</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{lesson.fileToUpload.name}</p>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        updateLesson(mod.id, lesson.id, { fileToUpload: undefined });
                                                                                    }}
                                                                                    style={{ marginTop: '15px', padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                >
                                                                                    <X size={16} /> Remove Selection
                                                                                </button>
                                                                            </div>
                                                                        ) : lesson.videoUrl ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#f0fdf4', marginBottom: '1rem' }}>
                                                                                    <CheckCircle2 size={32} color="#10b981" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#10b981' }}>Video Uploaded Successfully</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all', padding: '0 2rem' }}>{lesson.videoUrl}</p>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); updateLesson(mod.id, lesson.id, { videoUrl: '' }); }}
                                                                                    style={{ marginTop: '15px', padding: '8px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                >
                                                                                    <Trash2 size={16} /> Delete Video
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <UploadCloud size={40} color="#020617" style={{ marginBottom: '1rem' }} />
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Upload Video File</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Supports 4K/HD formats up to 2GB</p>
                                                                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                                                    <button
                                                                                        className="btn-standard"
                                                                                        style={{ background: '#020617', color: 'white', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            document.getElementById(`video-upload-${lesson.id}`)?.click();
                                                                                        }}
                                                                                    >
                                                                                        <Upload size={14} style={{ marginRight: '6px' }} /> Upload New
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn-standard"
                                                                                        style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#020617', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            fetchExistingVideos(mod.id, lesson.id);
                                                                                        }}
                                                                                    >
                                                                                        <Cloud size={14} style={{ marginRight: '6px' }} /> Browse Server
                                                                                    </button>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            id={`video-upload-${lesson.id}`}
                                                                            accept="video/mp4,video/quicktime,video/x-msvideo"
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    handleFileUpload(mod.id, lesson.id, e.target.files[0]);
                                                                                }
                                                                                e.target.value = ''; // Reset input to allow re-upload of same file if needed
                                                                            }}
                                                                        />
                                                                    </div>
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
                                                                            value={lesson.livePlatform || 'Microsoft Teams'}
                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, { livePlatform: e.target.value })}
                                                                        >
                                                                            <option>Microsoft Teams</option>
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="input-label">Secure Meeting Link</label>
                                                                        <input
                                                                            type="text"
                                                                            className="custom-input"
                                                                            value={lesson.liveLink || ''}
                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, { liveLink: e.target.value })}
                                                                            placeholder="https://teams.microsoft.com/l/meetup-join/..."
                                                                        />
                                                                    </div>

                                                                    {/* Recording Section */}
                                                                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1.5px dashed #e2e8f0' }}>
                                                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a4d3e' }}>
                                                                            <Video size={18} /> Recording Vault (Post-Session)
                                                                        </label>

                                                                        {uploadingVideos[lesson.id] ? (
                                                                            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #cbd5e1', textAlign: 'center' }}>
                                                                                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                                                                    <Video size={24} color="#1a4d3e" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#1a4d3e' }}>Uploading... {uploadProgress[lesson.id] || 0}%</h5>
                                                                                <div style={{ width: '100%', maxWidth: '200px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', margin: '10px auto' }}>
                                                                                    <div style={{ width: `${uploadProgress[lesson.id] || 0}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }}></div>
                                                                                </div>
                                                                            </div>
                                                                        ) : lesson.videoToUpload ? (
                                                                            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #1a4d3e', textAlign: 'center' }}>
                                                                                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                                                                    <Clock size={24} color="#1a4d3e" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 5px 0', fontWeight: 800 }}>Recording Staged</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{lesson.videoToUpload.name}</p>
                                                                                <button
                                                                                    onClick={() => updateLesson(mod.id, lesson.id, { videoToUpload: undefined })}
                                                                                    style={{ marginTop: '1rem', color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                                                                >
                                                                                    Remove Recording
                                                                                </button>
                                                                            </div>
                                                                        ) : lesson.videoUrl ? (
                                                                            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: 'black', aspectRatio: '16/9' }}>
                                                                                <video
                                                                                    src={lesson.videoUrl}
                                                                                    className="w-full h-full"
                                                                                    controls
                                                                                    controlsList="nodownload"
                                                                                    onContextMenu={(e: any) => e.preventDefault()}
                                                                                    style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleDeleteVideo(mod.id, lesson.id, lesson.videoUrl || '', 'video')}
                                                                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', zIndex: 10 }}
                                                                                >
                                                                                    Delete Recording
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ padding: '2.5rem', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '16px', textAlign: 'center' }}>
                                                                                <Video size={32} color="#64748b" style={{ marginBottom: '1rem' }} />
                                                                                <h5 style={{ margin: '0 0 10px 0', fontWeight: 800 }}>Upload Session Recording</h5>
                                                                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                                                                    <button
                                                                                        className="btn-standard"
                                                                                        style={{ background: '#020617', color: 'white', fontSize: '0.75rem', height: '36px' }}
                                                                                        onClick={() => document.getElementById(`recording-upload-${lesson.id}`)?.click()}
                                                                                    >
                                                                                        <Upload size={14} style={{ marginRight: '6px' }} /> Upload New
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn-standard"
                                                                                        style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#020617', fontSize: '0.75rem', height: '36px' }}
                                                                                        onClick={() => fetchExistingVideos(mod.id, lesson.id)}
                                                                                    >
                                                                                        <Cloud size={14} style={{ marginRight: '6px' }} /> Browse Server
                                                                                    </button>
                                                                                </div>
                                                                                <input
                                                                                    type="file"
                                                                                    id={`recording-upload-${lesson.id}`}
                                                                                    style={{ display: 'none' }}
                                                                                    accept="video/*"
                                                                                    onChange={(e: any) => {
                                                                                        if (e.target.files && e.target.files[0]) {
                                                                                            if (lesson.videoUrl) {
                                                                                                handleDeleteVideo(mod.id, lesson.id, lesson.videoUrl, 'video');
                                                                                            }
                                                                                            handleFileUpload(mod.id, lesson.id, e.target.files[0]);
                                                                                        }
                                                                                        e.target.value = '';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {lesson.type === 'material' && (
                                                                <>
                                                                    <div
                                                                        style={{ padding: '3rem', border: '2.5px dashed #cbd5e1', borderRadius: '20px', textAlign: 'center', background: 'white', cursor: uploadingVideos[lesson.id] ? 'not-allowed' : 'pointer' }}
                                                                        onClick={() => {
                                                                            if (!uploadingVideos[lesson.id] && !lesson.fileUrl && !lesson.fileToUpload) {
                                                                                document.getElementById(`file-upload-${lesson.id}`)?.click();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {uploadingVideos[lesson.id] ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#f8fafc', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                                                                    <UploadCloud size={32} color="#1a4d3e" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#1a4d3e' }}>Uploading... {uploadProgress[lesson.id] || 0}%</h5>
                                                                                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
                                                                                    <div style={{ width: `${uploadProgress[lesson.id] || 0}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }}></div>
                                                                                </div>
                                                                            </div>
                                                                        ) : lesson.fileToUpload ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#fffbeb', marginBottom: '1rem', border: '1.5px dashed #f59e0b' }}>
                                                                                    <Clock size={32} color="#f59e0b" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#f59e0b' }}>Pending Upload</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{lesson.fileToUpload.name}</p>
                                                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                                                    <button
                                                                                        onClick={(e: any) => {
                                                                                            e.stopPropagation();
                                                                                            if (lesson.fileToUpload) {
                                                                                                const url = URL.createObjectURL(lesson.fileToUpload);
                                                                                                const isPdf = lesson.fileToUpload.type === 'application/pdf' || lesson.fileToUpload.name.toLowerCase().endsWith('.pdf');
                                                                                                setPreviewAsset({ url, type: isPdf ? 'pdf' : 'image' });
                                                                                            }
                                                                                        }}
                                                                                        style={{ padding: '8px 16px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', color: '#b45309', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                    >
                                                                                        <Eye size={16} /> Preview
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e: any) => {
                                                                                            e.stopPropagation();
                                                                                            updateLesson(mod.id, lesson.id, { fileToUpload: undefined });
                                                                                            const fileInput = document.getElementById(`file-upload-${lesson.id}`) as HTMLInputElement;
                                                                                            if (fileInput) fileInput.value = '';
                                                                                        }}
                                                                                        style={{ padding: '8px 16px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                    >
                                                                                        <X size={16} /> Remove
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : lesson.fileUrl ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                                <div style={{ padding: '12px', borderRadius: '50%', background: '#f0fdf4', marginBottom: '1rem' }}>
                                                                                    <CheckCircle2 size={32} color="#10b981" />
                                                                                </div>
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#10b981' }}>File Ready</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{lesson.fileName || 'Resource Document'}</p>
                                                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                                                    <button
                                                                                        onClick={(e: any) => {
                                                                                            e.stopPropagation();
                                                                                            const url = lesson.fileUrl || '';
                                                                                            const isPdf = url.toLowerCase().endsWith('.pdf') || lesson.fileName?.toLowerCase().endsWith('.pdf');
                                                                                            setPreviewAsset({ url, type: isPdf ? 'pdf' : 'image' });
                                                                                        }}
                                                                                        style={{ padding: '8px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#1a4d3e', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                    >
                                                                                        <Eye size={16} /> Preview
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e: any) => {
                                                                                            e.stopPropagation(); handleDeleteVideo(mod.id, lesson.id, lesson.fileUrl || '', 'file');
                                                                                        }}
                                                                                        style={{ padding: '8px 16px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                                    >
                                                                                        <Trash2 size={16} /> Delete
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <FileText size={40} color="#020617" style={{ marginBottom: '1rem' }} />
                                                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Deploy Document Resource</h5>
                                                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Upload PDFs, Slides, or Blueprint assets (Max 50MB)</p>
                                                                                <button
                                                                                    className="btn-standard"
                                                                                    style={{ marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#020617' }}
                                                                                    onClick={() => document.getElementById(`file-upload-${lesson.id}`)?.click()}
                                                                                >
                                                                                    Browse Files
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            style={{ display: 'none' }}
                                                                            id={`file-upload-${lesson.id}`}
                                                                            onChange={(e: any) => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    handleFileUpload(mod.id, lesson.id, e.target.files[0]);
                                                                                }
                                                                                e.target.value = '';
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Document Questions Integration */}
                                                                    <div style={{ marginTop: '2.5rem', padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                                                                            <HelpCircle size={20} color="#1a4d3e" />
                                                                            <h5 style={{ margin: 0, fontWeight: 850, color: '#0f172a' }}>Material-Linked Questions</h5>
                                                                        </div>
                                                                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Enable this to require students to complete a validation quiz after studying this document.</p>

                                                                        <div className="evaluation-grid-material" style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                                                                            <style>{`
                                                                                    .evaluation-grid-material { grid-template-columns: min-content 1fr 1fr !important; }
                                                                                    @media (max-width: 640px) { .evaluation-grid-material { grid-template-columns: 1fr !important; } }
                                                                                `}</style>
                                                                            <div>
                                                                                <label className="input-label">Enabled</label>
                                                                                <div
                                                                                    onClick={() => {
                                                                                        const isEnabled = !!lesson.quizData;
                                                                                        updateLesson(mod.id, lesson.id, {
                                                                                            quizData: isEnabled ? undefined : { pass_mark: 80, questions: [] as any[] }
                                                                                        });
                                                                                    }}
                                                                                    style={{
                                                                                        width: '50px',
                                                                                        height: '26px',
                                                                                        background: lesson.quizData ? '#1a4d3e' : '#e2e8f0',
                                                                                        borderRadius: '13px',
                                                                                        position: 'relative',
                                                                                        cursor: 'pointer',
                                                                                        transition: 'all 0.3s'
                                                                                    }}
                                                                                >
                                                                                    <div style={{
                                                                                        width: '20px',
                                                                                        height: '20px',
                                                                                        background: 'white',
                                                                                        borderRadius: '50%',
                                                                                        position: 'absolute',
                                                                                        top: '3px',
                                                                                        left: lesson.quizData ? '27px' : '3px',
                                                                                        transition: 'left 0.3s'
                                                                                    }}></div>
                                                                                </div>
                                                                            </div>
                                                                            {lesson.quizData && (
                                                                                <>
                                                                                    <div>
                                                                                        <label className="input-label">Pass Mark (%)</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="custom-input"
                                                                                            placeholder="80"
                                                                                            value={lesson.quizData.pass_mark || 80}
                                                                                            onChange={(e) => updateLesson(mod.id, lesson.id, {
                                                                                                quizData: {
                                                                                                    pass_mark: parseInt(e.target.value) || 0,
                                                                                                    questions: lesson.quizData?.questions || [] as any[]
                                                                                                }
                                                                                            })}
                                                                                        />
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                                                        <button
                                                                                            className="btn-standard"
                                                                                            style={{ background: '#020617', whiteSpace: 'nowrap' }}
                                                                                            onClick={() => setDesigningQuiz({ moduleId: mod.id, lessonId: lesson.id })}
                                                                                        >
                                                                                            Design ({lesson.quizData.questions?.length || 0}) Questions
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn-standard"
                                                                                            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0f172a', whiteSpace: 'nowrap' }}
                                                                                            onClick={() => setViewingQuizKey({ moduleId: mod.id, lessonId: lesson.id })}
                                                                                        >
                                                                                            Preview Key
                                                                                        </button>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {lesson.type === 'quiz' && (
                                                                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                                        <HelpCircle size={20} color="#020617" />
                                                                        <h5 style={{ margin: 0, fontWeight: 800 }}>Evaluation Logic Configuration</h5>
                                                                    </div>
                                                                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>Configure passing thresholds and deployment rules for this validation unit.</p>
                                                                    <div className="evaluation-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                                                                        <style>{`
                                                                            @media (max-width: 640px) {
                                                                                .evaluation-grid {
                                                                                    grid-template-columns: 1fr !important;
                                                                                }
                                                                            }
                                                                        `}</style>
                                                                        <div>
                                                                            <label className="input-label">Pass Mark (%)</label>
                                                                            <input
                                                                                type="number"
                                                                                className="custom-input"
                                                                                placeholder="80"
                                                                                value={lesson.quizData?.pass_mark || 80}
                                                                                onChange={(e) => updateLesson(mod.id, lesson.id, {
                                                                                    quizData: {
                                                                                        pass_mark: parseInt(e.target.value) || 80,
                                                                                        questions: lesson.quizData?.questions || [] as any[]
                                                                                    }
                                                                                })}
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            className="btn-standard"
                                                                            style={{ alignSelf: 'flex-end', background: '#020617' }}
                                                                            onClick={() => setDesigningQuiz({ moduleId: mod.id, lessonId: lesson.id })}
                                                                        >
                                                                            Design Quiz Questions ({lesson.quizData?.questions?.length || 0})
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
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
                                            <button onClick={() => addLesson(mod.id, 'quiz')} className="type-btn"><HelpCircle size={18} /> Evaluation</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )
            }


            {/* Step 4: Review & Seal */}
            {step === 4 && (
                <div className="form-section-card animate-fade-in-up">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                            <CheckCircle2 size={40} color="#1a4d3e" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>Final Review</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>Verify your academic blueprint before finalizing the deployment.</p>
                    </div>

                    <div className="review-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <style>{`
                            @media (max-width: 1024px) {
                                .review-grid {
                                    grid-template-columns: 1fr !important;
                                    gap: 1.5rem !important;
                                }
                            }
                        `}</style>
                        <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '32px', border: '1.5px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                                <Users size={24} color="#1a4d3e" />
                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Cohort Operation</h4>
                            </div>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Operational Container</label>
                                    <p style={{ margin: '8px 0 0 0', fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>Jan 2026 Batch</p>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Code: WL-JAN-2026</span>
                                </div>
                            </div>
                        </div>

                        <div className="blueprint-card" style={{ background: 'white', padding: '3rem', border: '1.5px solid #f1f5f9', borderRadius: '32px' }}>
                            <style>{`
                                @media (max-width: 768px) {
                                    .blueprint-card {
                                        padding: 1.5rem !important;
                                    }
                                }
                            `}</style>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                                <BookOpen size={24} color="#1a4d3e" />
                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Intellectual Blueprint</h4>
                            </div>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Architecture</label>
                                        <p style={{ margin: '8px 0 0 0', fontWeight: 800, fontSize: '1.1rem' }}>{modules.length} Modules • {modules.flatMap((m: any) => m.lessons).length} Units</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Visibility</label>
                                        <p style={{ margin: '8px 0 0 0', fontWeight: 800, fontSize: '1.1rem' }}>Executive Archive</p>
                                    </div>
                                </div>
                                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            style={{ width: '24px', height: '24px', accentColor: '#1a4d3e' }}
                                            checked={confirmed}
                                            onChange={(e: any) => setConfirmed(e.target.checked)}
                                        />
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#475569' }}>
                                            I confirm this cohort session is compliant with global educational standards.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Bottom Sticky Action Bar */}
            <div className="sticky-actions-bar">
                <div className="back-btn-container" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="btn-standard"
                        style={{ background: 'transparent', border: '1.5px solid #e2e8f0', color: '#475569', opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto', padding: '0 1.25rem' }}
                    >
                        <ChevronLeft size={18} /> <span className="hide-mobile">Back</span>
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className="btn-standard btn-save-progress"
                        onClick={() => handleUpdateCourse(true)}
                        disabled={loading}
                    >
                        <Save size={18} /> <span>Save Progress</span>
                    </button>
                    <button
                        onClick={() => {
                            const errorMsg = validateStep(step);
                            if (errorMsg) {
                                setError(errorMsg);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                return;
                            }
                            setError(null);
                            if (step === 4) {
                                handleUpdateCourse();
                            } else {
                                setStep(Math.min(4, step + 1));
                            }
                        }}
                        disabled={loading}
                        className="btn-standard btn-next-step"
                    >
                        <span>{step === 4 ? 'Update Blueprint' : 'Proceed'}</span>
                        {step === 4 ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <div /> {/* Spacer for Grid Balancing */}
            </div>
            {/* Session Preview Modal */}
            {
                viewingLesson && (
                    <div
                        className="modal-overlay animate-fade-in"
                        onClick={() => { setViewingLesson(null); setIsMaximized(false); }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMaximized ? 0 : '2rem' }}
                    >
                        <div
                            className="animate-scale-up"
                            onClick={(e: any) => e.stopPropagation()}
                            style={{ background: 'white', width: '100%', height: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', borderRadius: isMaximized ? 0 : '32px', maxWidth: isMaximized ? 'none' : '1000px' }}
                        >
                            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div className={`lesson-type-badge type-${viewingLesson.type}`} style={{ transform: 'scale(1.1)' }}>
                                        {viewingLesson.type === 'video' && <Video size={16} />}
                                        {viewingLesson.type === 'live' && <Users size={16} />}
                                        {viewingLesson.type === 'material' && <FileText size={16} />}
                                        {viewingLesson.type === 'quiz' && <HelpCircle size={16} />}
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>{viewingLesson.title}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setIsMaximized(!isMaximized)}
                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
                                        title={isMaximized ? "Restore" : "Fullscreen"}
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button onClick={() => { setViewingLesson(null); setIsMaximized(false); }} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '0', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                {viewingLesson.type === 'video' && (
                                    <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', overflow: 'hidden' }}>
                                        {viewingLesson.videoUrl || viewingLesson.fileToUpload ? (
                                            <>
                                                {(() => {
                                                    const rawUrl = viewingLesson.videoUrl || '';
                                                    const getCleanUrl = (url: string) => {
                                                        if (!url) return '';
                                                        if (url.includes('mediadelivery.net')) return url;
                                                        
                                                        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
                                                        let finalUrl = url;

                                                        // Handle absolute local/legacy paths by replacing host
                                                        if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000') || url.includes('192.168.')) {
                                                            finalUrl = url.replace(/https?:\/\/[^\/]+/, baseUrl);
                                                        }
                                                        // Handle relative storage paths (with or without leading slash)
                                                        else if (url.startsWith('/storage/') || url.startsWith('storage/')) {
                                                            const cleanPath = url.startsWith('/') ? url : `/${url}`;
                                                            finalUrl = `${baseUrl}${cleanPath}`;
                                                        }
                                                        // Fallback: if it's just a path, assume it's under storage if it looks like one
                                                        else if (url.includes('lessons/') || url.includes('courses/')) {
                                                            finalUrl = `${baseUrl}/storage/${url}`;
                                                        }

                                                        // Strip internal Laravel paths if they leak into URLs
                                                        finalUrl = finalUrl.replace('app/public/', '');

                                                        // Force HTTPS for production domain to prevent mixed content
                                                        if (finalUrl.includes('layosgroupllc.com') && finalUrl.startsWith('http:')) {
                                                            return finalUrl.replace('http:', 'https:');
                                                        }

                                                        return finalUrl;
                                                    };
                                                    
                                                    const cleanUrl = viewingLesson.fileToUpload ? URL.createObjectURL(viewingLesson.fileToUpload) : getCleanUrl(rawUrl);
                                                    
                                                    return cleanUrl.includes('mediadelivery.net') ? (
                                                        <iframe
                                                            src={cleanUrl}
                                                            loading="lazy"
                                                            style={{ border: 'none', width: '100%', height: '100%', flex: 1, display: 'block' }}
                                                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                            allowFullScreen={true}
                                                        ></iframe>
                                                    ) : (
                                                        <video
                                                            src={cleanUrl}
                                                            controls
                                                            style={{ width: '100%', height: '100%' }}
                                                            controlsList="nodownload"
                                                            onContextMenu={(e: any) => e.preventDefault()}
                                                        />
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <>
                                                <Video size={48} opacity={0.5} style={{ marginBottom: '1.5rem' }} />
                                                <p style={{ fontWeight: 800, margin: 0 }}>Video Stream Simulator</p>
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>{viewingLesson.videoSource === 'upload' ? 'LayosCloud Secure Feed' : viewingLesson.videoUrl || 'No video uploaded yet'}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                {viewingLesson.type === 'live' && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: '#f0fdf4' }}>
                                        <Users size={64} color="#1a4d3e" style={{ marginBottom: '1.5rem' }} />
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.75rem', fontWeight: 900, color: '#1a4d3e' }}>Live Class Scheduled</h4>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>{viewingLesson.liveDate} at {viewingLesson.liveTime}</p>
                                        <p style={{ margin: '8px 0 2rem 0', fontSize: '1rem', color: '#94a3b8' }}>Platform: {viewingLesson.livePlatform}</p>
                                        <button className="btn-standard" style={{ background: '#1a4d3e', padding: '0 3rem', height: '56px', fontSize: '1.1rem' }}>Join Preview Link</button>
                                    </div>
                                )}
                                {viewingLesson.type === 'material' && (
                                    <div style={{ width: '100%', height: '100%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                                        {viewingLesson.fileUrl || viewingLesson.fileToUpload ? (
                                            <>
                                                {(() => {
                                                    const url = viewingLesson.fileToUpload ? URL.createObjectURL(viewingLesson.fileToUpload) : viewingLesson.fileUrl;
                                                    const fileName = viewingLesson.fileToUpload ? viewingLesson.fileToUpload.name : viewingLesson.fileName || 'Asset';
                                                    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                                                        return <img src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onContextMenu={(e: any) => e.preventDefault()} />;
                                                    }
                                                    if (fileName.match(/\.pdf$/i)) {
                                                        return <iframe
                                                            src={viewingLesson.fileToUpload ? URL.createObjectURL(viewingLesson.fileToUpload) : `${API_URL}/pdf-proxy?url=${encodeURIComponent(url || '')}#toolbar=0`}
                                                            style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
                                                            onLoad={() => setIframeLoading(false)}
                                                        />;
                                                    }
                                                    return (
                                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                            <FileText size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                                            <p style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Document Unit Ready</p>
                                                            <span style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '10px', display: 'block' }}>{fileName}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={64} opacity={0.5} style={{ marginBottom: '1.5rem' }} />
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.75rem', fontWeight: 900, color: '#2563eb' }}>Document Hub Unit</h4>
                                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>PDF/Slides Asset Ready</p>
                                            </>
                                        )}
                                        <button className="btn-standard" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', padding: '0 2.5rem', zIndex: 10 }} onClick={() => {
                                            const url = viewingLesson.fileToUpload ? URL.createObjectURL(viewingLesson.fileToUpload) : viewingLesson.fileUrl;
                                            if (url) window.open(url, '_blank');
                                        }}>
                                            <Eye size={18} /> Preview Channel
                                        </button>
                                    </div>
                                )}
                                {viewingLesson.type === 'quiz' && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: '#fefce8' }}>
                                        <HelpCircle size={64} color="#ca8a04" style={{ marginBottom: '1.5rem' }} />
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.75rem', fontWeight: 900, color: '#ca8a04' }}>Knowledge Validation</h4>
                                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>Curriculum Evaluation Node</p>
                                        <button className="btn-standard" style={{ background: '#ca8a04', padding: '0 3rem', height: '56px', fontSize: '1.1rem', marginTop: '2rem' }}>Start Simulator</button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
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
                )
            }
            {/* Premium Notification Toast */}
            {
                notification.show && (
                    <div style={{
                        position: 'fixed',
                        top: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        animation: 'slideInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}>
                        <div style={{
                            background: notification.type === 'success' ? 'rgba(26, 77, 62, 0.95)' : 'rgba(153, 27, 27, 0.95)',
                            backdropFilter: 'blur(12px)',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontWeight: 800,
                            fontSize: '0.95rem'
                        }}>
                            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {notification.message}
                        </div>
                    </div>
                )
            }

            <style>{`
                @keyframes slideInDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .maximized-preview {
                    position: fixed !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 2000 !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                }
                .curriculum-module.dragging {
                    opacity: 0.4;
                    transform: scale(0.98);
                    border: 2px dashed #020617;
                    background: #f8fafc;
                }
                .lesson-drag-container.dragging {
                    opacity: 0.4;
                    transform: scale(0.98);
                    border: 2px dashed #cbd5e1;
                    background: #fcfdfe;
                    border-radius: 12px;
                }
                .curriculum-module, .lesson-drag-container {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: default;
                }
                .module-header, .lesson-card {
                    user-select: none;
                }
            `}</style>

            {/* Asset Preview Modal */}
            {previewAsset && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', padding: isMaximized ? 0 : '2rem' }}>
                    <div style={{ background: 'white', borderRadius: isMaximized ? 0 : '32px', overflow: 'hidden', width: '100%', height: '100%', maxWidth: isMaximized ? 'none' : '1000px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfdfe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '8px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {previewAsset.type === 'pdf' ? <FileText size={20} color="#1a4d3e" /> : <Eye size={20} color="#1a4d3e" />}
                                </div>
                                <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>Material Intelligence Preview</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
                                    title={isMaximized ? "Restore" : "Fullscreen"}
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        setPreviewAsset(null);
                                        setIframeLoading(true);
                                        setIsMaximized(false);
                                    }}
                                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: '0', background: '#f8fafc', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            {iframeLoading && previewAsset.type === 'pdf' && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10 }}>
                                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', border: '4px solid #f1f5f9', borderTopColor: '#1a4d3e', animation: 'spin-inst-edit 1s linear infinite' }}></div>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={32} color="#1a4d3e" opacity={0.3} />
                                        </div>
                                    </div>
                                    <h4 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>Architecting Secure View...</h4>
                                    <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>Preparing high-fidelity instructional workspace</p>
                                    <style>{`
                                        @keyframes spin-inst-edit { to { transform: rotate(360deg); } }
                                    `}</style>
                                </div>
                            )}
                            {previewAsset.type === 'pdf' ? (
                                <iframe
                                    src={`${previewAsset.url}#toolbar=0`}
                                    style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}
                                    title="PDF Preview"
                                    onLoad={() => setIframeLoading(false)}
                                />
                            ) : (
                                <img
                                    src={previewAsset.url}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }}
                                    alt="Asset Preview"
                                    onContextMenu={(e: any) => e.preventDefault()}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Design Modal */}
            {designingQuiz && (() => {
                const mod = modules.find(m => m.id === designingQuiz.moduleId);
                const lesson = mod?.lessons.find(l => l.id === designingQuiz.lessonId);
                const quizData = lesson?.quizData || { pass_mark: 80, questions: [] as any[] };


                return (
                    <div
                        className="modal-overlay animate-fade-in"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    >
                        <div
                            className="quiz-modal animate-scale-up"
                            style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <style>{`
                                @media (max-width: 640px) {
                                    .quiz-modal {
                                        border-radius: 24px !important;
                                    }
                                    .quiz-header {
                                        padding: 1.5rem !important;
                                    }
                                    .quiz-body {
                                        padding: 1.5rem !important;
                                    }
                                    .question-card {
                                        padding: 1.5rem !important;
                                    }
                                }
                                @media (min-width: 641px) {
                                    .quiz-modal {
                                        border-radius: 40px !important;
                                    }
                                    .quiz-header {
                                        padding: 2.5rem 3rem !important;
                                    }
                                    .quiz-body {
                                        padding: 3rem !important;
                                    }
                                    .question-card {
                                        padding: 2.5rem !important;
                                    }
                                }
                            `}</style>
                            <div className="quiz-header" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#1a4d3e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <HelpCircle size={18} />
                                        </div>
                                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>Evaluation Intelligence Designer</h3>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Crafting validation units for: <span style={{ color: '#1a4d3e' }}>{lesson?.title}</span></p>
                                </div>
                                <button
                                    onClick={() => setDesigningQuiz(null)}
                                    style={{ background: 'white', border: '1.5px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="quiz-body" style={{ flex: 1, overflowY: 'auto' }}>
                                {quizData.questions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '30px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#94a3b8' }}>
                                            <Plus size={32} />
                                        </div>
                                        <h4 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Empty Evaluation Pipeline</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Start building your validation unit by adding the first question.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '2.5rem' }}>
                                        {quizData.questions.map((q, qIdx) => (
                                            <div key={q.id} className="question-card" style={{ background: '#f8fafc', borderRadius: '24px', border: '1.5px solid #f1f5f9', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '-15px', left: '2rem', background: '#1a4d3e', color: 'white', padding: '4px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                                                    QUESTION {qIdx + 1}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...quizData.questions];
                                                        newQuestions.splice(qIdx, 1);
                                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                            quizData: { ...quizData, questions: newQuestions }
                                                        });
                                                    }}
                                                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fff1f2', border: 'none', color: '#e11d48', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label className="input-label">Question Text</label>
                                                    <textarea
                                                        className="custom-input"
                                                        rows={2}
                                                        value={q.question}
                                                        onChange={(e) => {
                                                            const newQuestions = [...quizData.questions];
                                                            newQuestions[qIdx].question = e.target.value;
                                                            updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                quizData: { ...quizData, questions: newQuestions }
                                                            });
                                                        }}
                                                        placeholder="e.g. What is the primary objective of this module?"
                                                        style={{ resize: 'none' }}
                                                    />
                                                </div>

                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    <label className="input-label">Options & Correct Answer</label>
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <div
                                                                onClick={() => {
                                                                    const newQuestions = [...quizData.questions];
                                                                    newQuestions[qIdx].correct_answer = oIdx;
                                                                    updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                        quizData: { ...quizData, questions: newQuestions }
                                                                    });
                                                                }}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    border: '2px solid',
                                                                    borderColor: q.correct_answer === oIdx ? '#1a4d3e' : '#e2e8f0',
                                                                    background: q.correct_answer === oIdx ? '#1a4d3e' : 'white',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {q.correct_answer === oIdx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="custom-input"
                                                                style={{ flex: 1, padding: '0.75rem 1.25rem' }}
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...quizData.questions];
                                                                    newQuestions[qIdx].options[oIdx] = e.target.value;
                                                                    updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                        quizData: { ...quizData, questions: newQuestions }
                                                                    });
                                                                }}
                                                                placeholder={`Option ${oIdx + 1}`}
                                                            />
                                                            {q.options.length > 2 && (
                                                                <button
                                                                    onClick={() => {
                                                                        const newQuestions = [...quizData.questions];
                                                                        newQuestions[qIdx].options.splice(oIdx, 1);
                                                                        if (newQuestions[qIdx].correct_answer >= newQuestions[qIdx].options.length) {
                                                                            newQuestions[qIdx].correct_answer = 0;
                                                                        }
                                                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                            quizData: { ...quizData, questions: newQuestions }
                                                                        });
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {q.options.length < 5 && (
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...quizData.questions];
                                                                newQuestions[qIdx].options.push('');
                                                                updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                    quizData: { ...quizData, questions: newQuestions }
                                                                });
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: '1.5px dashed #e2e8f0',
                                                                padding: '0.75rem',
                                                                borderRadius: '12px',
                                                                color: '#64748b',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                marginTop: '0.5rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px'
                                                            }}
                                                        >
                                                            <Plus size={14} /> Add Option
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                            quizData: {
                                                ...quizData,
                                                questions: [
                                                    ...quizData.questions,
                                                    {
                                                        id: 'q' + Date.now(),
                                                        question: '',
                                                        options: ['', ''],
                                                        correct_answer: 0
                                                    }
                                                ]
                                            }
                                        });
                                    }}
                                    className="btn-standard"
                                    style={{
                                        width: '100%',
                                        marginTop: '2rem',
                                        background: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        color: '#0f172a',
                                        height: '64px',
                                        fontWeight: 900,
                                        gap: '12px'
                                    }}
                                >
                                    <Plus size={20} /> Add New Question
                                </button>
                            </div>                             <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={() => {
                                            // Toggle a simple preview of the answer key
                                            alert("Evaluation Key:\n" + quizData.questions.map((q, i) => `Q${i + 1}: Option ${q.correct_answer + 1}`).join('\n'));
                                        }}
                                        className="btn-standard"
                                        style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#1a4d3e', fontWeight: 800 }}
                                    >
                                        Check Answer Key
                                    </button>
                                </div>
                                <button
                                    onClick={() => setDesigningQuiz(null)}
                                    className="btn-standard"
                                    style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', padding: '0 2.5rem' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="quiz-body" style={{ flex: 1, overflowY: 'auto' }}>
                                {quizData.questions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '30px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#94a3b8' }}>
                                            <Plus size={32} />
                                        </div>
                                        <h4 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Empty Evaluation Pipeline</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Start building your validation unit by adding the first question.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '2.5rem' }}>
                                        {quizData.questions.map((q, qIdx) => (
                                            <div key={q.id} className="question-card" style={{ background: '#f8fafc', borderRadius: '24px', border: '1.5px solid #f1f5f9', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '-15px', left: '2rem', background: '#1a4d3e', color: 'white', padding: '4px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                                                    QUESTION {qIdx + 1}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...quizData.questions];
                                                        newQuestions.splice(qIdx, 1);
                                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                            quizData: { ...quizData, questions: newQuestions }
                                                        });
                                                    }}
                                                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fff1f2', border: 'none', color: '#e11d48', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <div style={{ marginBottom: '2rem' }}>
                                                    <label className="input-label">Question Text</label>
                                                    <textarea
                                                        className="custom-input"
                                                        rows={2}
                                                        value={q.question}
                                                        onChange={(e) => {
                                                            const newQuestions = [...quizData.questions];
                                                            newQuestions[qIdx].question = e.target.value;
                                                            updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                quizData: { ...quizData, questions: newQuestions }
                                                            });
                                                        }}
                                                        placeholder="e.g. What is the primary objective of this module?"
                                                        style={{ resize: 'none' }}
                                                    />
                                                </div>

                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    <label className="input-label">Options & Correct Answer</label>
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <div
                                                                onClick={() => {
                                                                    const newQuestions = [...quizData.questions];
                                                                    newQuestions[qIdx].correct_answer = oIdx;
                                                                    updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                        quizData: { ...quizData, questions: newQuestions }
                                                                    });
                                                                }}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    border: '2px solid',
                                                                    borderColor: q.correct_answer === oIdx ? '#1a4d3e' : '#e2e8f0',
                                                                    background: q.correct_answer === oIdx ? '#1a4d3e' : 'white',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {q.correct_answer === oIdx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="custom-input"
                                                                style={{ flex: 1, padding: '0.75rem 1.25rem' }}
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newQuestions = [...quizData.questions];
                                                                    newQuestions[qIdx].options[oIdx] = e.target.value;
                                                                    updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                        quizData: { ...quizData, questions: newQuestions }
                                                                    });
                                                                }}
                                                                placeholder={`Option ${oIdx + 1}`}
                                                            />
                                                            {q.options.length > 2 && (
                                                                <button
                                                                    onClick={() => {
                                                                        const newQuestions = [...quizData.questions];
                                                                        newQuestions[qIdx].options.splice(oIdx, 1);
                                                                        if (newQuestions[qIdx].correct_answer >= newQuestions[qIdx].options.length) {
                                                                            newQuestions[qIdx].correct_answer = 0;
                                                                        }
                                                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                            quizData: { ...quizData, questions: newQuestions }
                                                                        });
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {q.options.length < 5 && (
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...quizData.questions];
                                                                newQuestions[qIdx].options.push('');
                                                                updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                                                    quizData: { ...quizData, questions: newQuestions }
                                                                });
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: '1.5px dashed #e2e8f0',
                                                                padding: '0.75rem',
                                                                borderRadius: '12px',
                                                                color: '#64748b',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                marginTop: '0.5rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px'
                                                            }}
                                                        >
                                                            <Plus size={14} /> Add Option
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        updateLesson(designingQuiz.moduleId, designingQuiz.lessonId, {
                                            quizData: {
                                                ...quizData,
                                                questions: [
                                                    ...quizData.questions,
                                                    {
                                                        id: 'q' + Date.now(),
                                                        question: '',
                                                        options: ['', ''],
                                                        correct_answer: 0
                                                    }
                                                ]
                                            }
                                        });
                                    }}
                                    className="btn-standard"
                                    style={{
                                        width: '100%',
                                        marginTop: '2rem',
                                        background: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        color: '#0f172a',
                                        height: '64px',
                                        fontWeight: 900,
                                        gap: '12px'
                                    }}
                                >
                                    <Plus size={20} /> Add New Question
                                </button>
                            </div>
                            <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={() => {
                                            // Toggle a simple preview of the answer key
                                            alert("Evaluation Key:\n" + quizData.questions.map((q, i) => `Q${i + 1}: Option ${q.correct_answer + 1}`).join('\n'));
                                        }}
                                        className="btn-standard"
                                        style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#1a4d3e', fontWeight: 800 }}
                                    >
                                        Check Answer Key
                                    </button>
                                </div>
                                <button
                                    onClick={() => setDesigningQuiz(null)}
                                    className="btn-standard"
                                    style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', padding: '0 2.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setDesigningQuiz(null)}
                                    className="btn-standard"
                                    style={{ background: '#1a4d3e', color: 'white', padding: '0 3rem' }}
                                >
                                    Finalize Evaluation
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Quiz Answer Key Modal */}
            {viewingQuizKey && (() => {
                const mod = modules.find(m => m.id === viewingQuizKey.moduleId);
                const lesson = mod?.lessons.find(l => l.id === viewingQuizKey.lessonId);
                const questions = lesson?.quizData?.questions || [];

                return (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Evaluation Intelligence: Answer Key</h3>
                                    <p style={{ margin: '4px 0 0 0', color: '#1a4d3e', fontWeight: 700, fontSize: '0.9rem' }}>{lesson?.title} • {questions.length} Validation Units</p>
                                </div>
                                <button onClick={() => setViewingQuizKey(null)} style={{ background: 'white', border: '1.5px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                                {questions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                        <HelpCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748b', fontWeight: 600 }}>No validation questions defined yet.</p>
                                    </div>
                                ) : questions.map((q: any, idx: number) => (
                                    <div key={idx} style={{ marginBottom: '2rem', padding: '2rem', borderRadius: '24px', border: '1.5px solid #f1f5f9', background: '#fcfdfe' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8' }}>Validation Unit {idx + 1}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1a4d3e', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>MASTER KEY</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 850, color: '#0f172a', lineHeight: 1.4, fontSize: '1.1rem' }}>{q.question}</h4>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {q.options.map((opt: string, oIdx: number) => {
                                                const isRightAnswer = q.correct_answer === oIdx;
                                                return (
                                                    <div
                                                        key={oIdx}
                                                        style={{
                                                            padding: '1.1rem 1.5rem',
                                                            borderRadius: '16px',
                                                            background: isRightAnswer ? '#f0fdf4' : 'white',
                                                            border: `1.5px solid ${isRightAnswer ? '#10b98140' : '#f1f5f9'}`,
                                                            color: isRightAnswer ? '#166534' : '#64748b',
                                                            fontWeight: isRightAnswer ? 800 : 500,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {isRightAnswer && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor' }}></div>}
                                                        </div>
                                                        {opt}
                                                        {isRightAnswer && <CheckCircle2 size={16} style={{ marginLeft: 'auto' }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setViewingQuizKey(null)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}>Close Answer Key</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {isBrowsingVideos && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1210, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Cloud Repository: Course Videos</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Deploy existing assets without re-uploading.</p>
                            </div>
                            <button onClick={() => setIsBrowsingVideos(false)} style={{ background: 'white', border: '1.5px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            {existingVideos.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                    <CloudOff size={60} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>No assets detected in repository.</h4>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Upload original content to populate your cloud vault.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                    {existingVideos.map((video, idx) => (
                                        <div key={idx} className="video-asset-card" style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative' }}>
                                            <div style={{ aspectRatio: '16/9', background: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Video size={40} color="#334155" style={{ opacity: 0.3 }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1.25rem' }}>
                                                    <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 900, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '6px' }}>
                                                        {video.size}
                                                    </span>
                                                    <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 900, background: video.source === 'bunny' ? '#3b82f6' : '#10b981', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                        {video.source || 'Local'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem' }}>
                                                <h5 style={{ margin: '0 0 8px 0', fontWeight: 850, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.name}</h5>
                                                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Modified: {new Date(video.last_modified).toLocaleDateString()}</p>
                                                <button
                                                    onClick={() => selectExistingVideo(video.url)}
                                                    className="btn-standard"
                                                    style={{ width: '100%', background: '#0f172a', color: 'white', height: '40px', fontWeight: 800, fontSize: '0.85rem' }}
                                                >
                                                    Deploy Asset
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsBrowsingVideos(false)} className="btn-standard" style={{ background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '0 2rem' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {previewAsset && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: previewAsset.type === 'pdf' ? '1000px' : 'auto', maxHeight: '90vh', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                                {previewAsset.type === 'pdf' ? 'Document Viewer' : 'Image Preview'}
                            </h3>
                            <button
                                onClick={() => setPreviewAsset(null)}
                                className="btn-standard"
                                style={{ background: 'white', border: '1.5px solid #e2e8f0', width: '36px', height: '36px', padding: 0, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: '#e2e8f0', padding: previewAsset.type === 'pdf' ? 0 : '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {previewAsset.type === 'pdf' ? (
                                <iframe
                                    src={previewAsset.url}
                                    style={{ width: '100%', height: 'calc(90vh - 70px)', border: 'none' }}
                                    title="PDF Document"
                                />
                            ) : (
                                <img src={previewAsset.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 120px)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
