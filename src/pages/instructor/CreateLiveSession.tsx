import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    Clock,
    Video,
    AlertCircle,
    Link as LinkIcon,
    ArrowLeft,
    MonitorIcon,
    CalendarDays,
    FileVideo,
    Loader2,
    ChevronRight,
    Zap,
    Sparkles,
    ShieldCheck,
    X,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Course {
    id: number;
    title: string;
}

export default function CreateLiveSession() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        date: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
    });
    const [recordingUrl, setRecordingUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`${API_URL}/courses`, {
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                if (response.ok) setCourses(data);
            } catch (err) {
                console.error("Fetch Courses Error:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('course_id', formData.courseId);
            submitData.append('scheduled_date', formData.date);
            submitData.append('start_time', formData.startTime);
            submitData.append('end_time', formData.endTime);
            submitData.append('meeting_link', formData.meetingLink);
            if (recordingUrl) submitData.append('recording_link', recordingUrl);

            const response = await fetch(`${API_URL}/live-sessions`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: submitData
            });

            if (response.ok) {
                toast.success('Broadcast scheduled');
                navigate('/instructor/live');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Initialization failure.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        const token = localStorage.getItem('token');
        setUploading(true);
        setUploadProgress(0);
        const fData = new FormData();
        fData.append('video', file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload-video`, true);
            xhr.setRequestHeader('Accept', 'application/json');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (ev) => {
                if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            };

            const response: any = await new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error('Upload failed'));
                };
                xhr.onerror = () => reject(new Error('Network failure'));
                xhr.send(fData);
            });

            if (response.success) {
                setRecordingUrl(response.video_url);
                toast.success('Archival artifact synchronized');
            } else throw new Error(response.message);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = async () => {
        if (!window.confirm('Redact this artifact?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/delete-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ video_url: recordingUrl })
            });
            if (response.ok) {
                setRecordingUrl('');
                toast.success('Asset redacted');
            }
        } catch (err) {
            toast.error('Operation failure');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between animate-fade-in-up">
                <Link to="/instructor/live" className="group flex items-center gap-4 text-[10px] font-black text-brand-muted hover:text-brand-emerald uppercase tracking-[0.3em] transition-all no-underline">
                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Operations
                </Link>
            </div>

            <header className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                        <Zap className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Broadcast Initialization</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Schedule <span className="text-brand-emerald">Link</span></h1>
                    <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Configure the operational parameters for a new real-time instructional engagement.</p>
                </div>
            </header>

            {error && (
                <div className="p-6 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-[32px] animate-in slide-in-from-top-4 duration-500 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AlertCircle size={24} />
                        <span className="font-black text-xs uppercase tracking-widest">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-white/20 rounded-xl border-none bg-transparent cursor-pointer"><X size={18} /></button>
                </div>
            )}

            <form className="bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 space-y-12 shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.1s' }} onSubmit={handleSubmit}>
                {/* Logistics Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <ShieldCheck className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">System Logistics</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Session Title</label>
                            <input
                                type="text"
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all placeholder:text-brand-muted/30"
                                placeholder="e.g. Advanced Q&A Workshop"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Academic Course Link</label>
                            <select
                                className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all appearance-none"
                                required
                                value={formData.courseId}
                                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                            >
                                <option value="">{loadingCourses ? 'Accessing Syllabus Archive...' : 'Select Target Course'}</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Broadcast Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <CalendarDays className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Start Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                    <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">End Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                        required
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                    <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Broadcast URL (Teams/Zoom)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all"
                                    placeholder="https://teams.microsoft.com/l/meetup-join/..."
                                    value={formData.meetingLink}
                                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                                <LinkIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Artifact Section */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-brand-border pb-6">
                        <FileVideo className="text-brand-emerald" size={20} />
                        <h3 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Archival Artifact</h3>
                    </div>

                    <div className="space-y-6">
                        {uploading ? (
                            <div className="p-16 bg-brand-beige/10 dark:bg-white/5 rounded-xl border-2 border-brand-border border-dashed text-center space-y-8">
                                <div className="relative w-32 h-32 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-brand-border" />
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * uploadProgress) / 100} className="text-brand-emerald transition-all duration-500" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-brand-charcoal dark:text-white">{uploadProgress}%</div>
                                </div>
                                <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em] animate-pulse">Streaming Artifact...</p>
                            </div>
                        ) : recordingUrl ? (
                            <div className="p-10 bg-brand-emerald/10 rounded-xl border-2 border-brand-emerald/20 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-brand-emerald text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-brand-emerald/20"><CheckCircle2 size={32} /></div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Asset Synchronized</div>
                                        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest truncate max-w-[200px]">{recordingUrl}</div>
                                    </div>
                                </div>
                                <button type="button" onClick={handleDeleteVideo} className="px-8 h-12 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer">Redact Artifact</button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                <div className="p-16 bg-brand-beige/20 dark:bg-white/5 rounded-xl border-2 border-brand-border border-dashed text-center space-y-6 group-hover:border-brand-emerald transition-all">
                                    <div className="w-20 h-20 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[24px] flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all"><Plus size={40} /></div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Attach Instruction Artifact</p>
                                        <p className="text-xs font-medium text-brand-muted">Optional: Synchronize a pre-recorded broadcast for immediate archival access.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Establishing Link...</span>
                            </>
                        ) : (
                            <>
                                Schedule Broadcast <ChevronRight size={24} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-6 p-10 bg-brand-beige/10 dark:bg-white/5 rounded-xl border border-brand-border border-dashed text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles size={16} className="text-brand-emerald" />
                Live sessions are automatically broadcasted to the student dashboard at the scheduled time.
            </div>
        </div>
    );
}
