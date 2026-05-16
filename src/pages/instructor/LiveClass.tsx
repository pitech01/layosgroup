import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Plus,
    Calendar,
    Clock,
    Video,
    Play,
    AlertCircle,
    Inbox,
    CheckCircle2,
    X,
    Save,
    FileVideo,
    Edit,
    Trash2,
    Loader2,
    Search,
    Filter,
    ChevronRight,
    Zap,
    Sparkles,
    ArrowUpRight,
    ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LiveSession {
    id: number;
    title: string;
    course_id: number;
    course: {
        title: string;
    };
    scheduled_date: string;
    start_time: string;
    end_time: string;
    meeting_link: string;
    recording_link?: string;
}

export default function LiveClass() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "ended">("all");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recordingModal, setRecordingModal] = useState<{ show: boolean, sessionId: number | null }>({ show: false, sessionId: null });
    const [savingRecording, setSavingRecording] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [editModal, setEditModal] = useState<{ show: boolean, session: LiveSession | null }>({ show: false, session: null });
    const [courses, setCourses] = useState<any[]>([]);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        course_id: '',
        scheduled_date: '',
        start_time: '',
        end_time: '',
        meeting_link: '',
        recording_link: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchSessions = async () => {
        try {
            const response = await fetch(`${API_URL}/live-sessions`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) setSessions(data);
        } catch (err) {
            console.error("Fetch Sessions Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) setCourses(data);
        } catch (err) {
            console.error("Fetch Courses Error:", err);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchCourses();
    }, [API_URL]);

    const handleEdit = (session: LiveSession) => {
        setEditModal({ show: true, session });
        setEditForm({
            title: session.title,
            course_id: session.course_id.toString(),
            scheduled_date: session.scheduled_date,
            start_time: session.start_time,
            end_time: session.end_time,
            meeting_link: session.meeting_link,
            recording_link: session.recording_link || ''
        });
        setUploadedUrl(session.recording_link || '');
    };

    const handleUpdateSession = async () => {
        if (!editModal.session) return;
        setUpdating(true);
        try {
            const response = await fetch(`${API_URL}/live-sessions/${editModal.session.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                toast.success('Session updated');
                fetchSessions();
                setEditModal({ show: false, session: null });
            } else throw new Error('Modification failure.');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteSession = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel and delete this live session?')) return;
        try {
            const response = await fetch(`${API_URL}/live-sessions/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                setSessions(sessions.filter(s => s.id !== id));
                toast.success('Session terminated');
            }
        } catch (err) {
            toast.error('Network failure');
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getSessionStatus = (session: LiveSession) => {
        const now = new Date();
        const start = new Date(`${session.scheduled_date}T${session.start_time}`);
        const end = new Date(`${session.scheduled_date}T${session.end_time}`);
        if (now >= start && now <= end) return 'live';
        if (now < start) return 'upcoming';
        return 'ended';
    };

    const filteredSessions = sessions.filter((session: LiveSession) => {
        const status = getSessionStatus(session);
        if (filter === "all") return true;
        return status === filter;
    });

    const handleFileUpload = async (file: File) => {
        const token = localStorage.getItem('token');
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('video', file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload-video`, true);
            xhr.setRequestHeader('Accept', 'application/json');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
            };

            const response: any = await new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error('Upload failed'));
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(formData);
            });

            if (response.success) {
                setUploadedUrl(response.video_url);
                if (editModal.show) setEditForm(prev => ({ ...prev, recording_link: response.video_url }));
                toast.success('Video sync complete');
            } else throw new Error(response.message);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = async () => {
        if (!window.confirm('Delete this recording permanently?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/delete-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ video_url: uploadedUrl })
            });
            if (response.ok) {
                setUploadedUrl('');
                if (editModal.show) setEditForm(prev => ({ ...prev, recording_link: '' }));
                toast.success('Asset redacted');
            }
        } catch (err) {
            toast.error('Deletion failure');
        }
    };

    const handleSaveRecording = async () => {
        if (!recordingModal.sessionId || !uploadedUrl) return;
        setSavingRecording(true);
        try {
            const response = await fetch(`${API_URL}/live-sessions/${recordingModal.sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ recording_link: uploadedUrl })
            });
            if (response.ok) {
                toast.success('Recording archived');
                fetchSessions();
                setRecordingModal({ show: false, sessionId: null });
                setUploadedUrl('');
            } else throw new Error('Save failure.');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSavingRecording(false);
        }
    };

    return (
        <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6 md:px-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in-up">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                            <Video className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Broadcast Operations</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">Live <span className="text-brand-emerald">Classes</span></h1>
                        <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">Orchestrate real-time academic engagements and manage instructional archives.</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/instructor/live/create')}
                    className="h-20 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 group border-none cursor-pointer"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" /> Initialize Session
                </button>
            </header>

            {/* Hub Bar */}
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex-1 flex gap-2 p-2 bg-brand-beige/20 dark:bg-white/5 rounded-[28px] border border-brand-border">
                    {(['all', 'upcoming', 'live', 'ended'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-xl shadow-brand-charcoal/5' : 'text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filter sessions..."
                            className="h-18 pl-14 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[24px] focus:outline-none focus:border-brand-emerald transition-all text-xs font-bold text-brand-charcoal dark:text-white"
                        />
                    </div>
                    <button className="h-18 px-8 bg-white dark:bg-white/5 border-2 border-brand-border rounded-[24px] flex items-center gap-4 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer">
                        <Filter size={18} /> Protocol
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-8 bg-brand-beige/20 dark:bg-white/5 rounded-[60px] border-2 border-brand-border border-dashed">
                        <Loader2 className="animate-spin text-brand-emerald" size={64} />
                        <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em] animate-pulse">Syncing Session Grid...</p>
                    </div>
                ) : filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredSessions.map((session, idx) => {
                            const status = getSessionStatus(session);
                            const isLive = status === 'live';
                            const isUpcoming = status === 'upcoming';
                            const isEnded = status === 'ended';
                            
                            return (
                                <div key={session.id} className="group bg-white dark:bg-brand-charcoal rounded-[56px] border border-brand-border p-10 flex flex-col hover:shadow-[0_40px_80px_-20px_rgba(26,77,62,0.15)] transition-all duration-700 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                                    <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <button onClick={() => handleEdit(session)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/10 border-2 border-brand-border rounded-xl text-brand-muted hover:text-brand-emerald transition-colors cursor-pointer"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteSession(session.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="flex-1 space-y-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${
                                                isLive ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                isUpcoming ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-brand-beige dark:bg-white/10 text-brand-muted border-brand-border'
                                            }`}>
                                                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                                                {status}
                                            </div>
                                            <div className="text-[9px] font-black text-brand-muted uppercase tracking-[0.2em]">{session.course?.title}</div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none group-hover:text-brand-emerald transition-colors line-clamp-2 uppercase">
                                                {session.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-6">
                                                <div className="flex items-center gap-2 text-brand-muted font-bold text-xs">
                                                    <Calendar size={14} className="text-brand-emerald" /> {new Date(session.scheduled_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-brand-muted font-bold text-xs">
                                                    <Clock size={14} className="text-brand-emerald" /> {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-brand-border space-y-4">
                                        {isEnded ? (
                                            <div className="space-y-4">
                                                <button onClick={() => handleOpenRecordingModal(session)} className={`w-full h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all border-none cursor-pointer ${session.recording_link ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-brand-charcoal dark:bg-brand-emerald text-white'}`}>
                                                    {session.recording_link ? <><FileVideo size={18} /> Review Artifact</> : <><Plus size={18} /> Archival Sync Required</>}
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                disabled={!session.meeting_link}
                                                onClick={() => session.meeting_link && window.open(session.meeting_link, '_blank')}
                                                className="w-full h-18 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl shadow-brand-charcoal/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 border-none cursor-pointer"
                                            >
                                                <Play size={20} fill="currentColor" /> Initiate Broadcast
                                            </button>
                                        )}
                                        {!session.meeting_link && !isEnded && (
                                            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                                                <AlertCircle size={14} /> Protocol Incomplete: Missing Link
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-brand-charcoal py-40 text-center rounded-[60px] border-2 border-brand-border border-dashed shadow-sm space-y-10">
                        <div className="w-32 h-32 bg-brand-beige dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto text-brand-muted/30 group relative overflow-hidden">
                            <Inbox size={64} className="group-hover:scale-125 transition-transform duration-1000" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Operational Silence</h3>
                            <p className="text-brand-muted font-medium text-lg max-w-md mx-auto">No instructional broadcasts are currently scheduled in the master timeline.</p>
                        </div>
                        <button onClick={() => navigate('/instructor/live/create')} className="inline-flex h-18 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] items-center gap-4 shadow-2xl shadow-brand-charcoal/20 no-underline hover:scale-105 transition-all border-none cursor-pointer">
                            Schedule First Link <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {recordingModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <div className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-xl animate-fade-in" onClick={() => setRecordingModal({ show: false, sessionId: null })}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 space-y-12 shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FileVideo className="text-brand-emerald" size={24} />
                                    <h2 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Archival <span className="text-brand-emerald">Sync</span></h2>
                                </div>
                                <p className="text-brand-muted font-medium">Synchronize the instructional broadcast recording with the master archive.</p>
                            </div>
                            <button onClick={() => setRecordingModal({ show: false, sessionId: null })} className="w-14 h-14 flex items-center justify-center bg-brand-beige/50 dark:bg-white/5 border-2 border-brand-border rounded-[20px] text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all cursor-pointer"><X size={24} /></button>
                        </div>

                        <div className="space-y-10">
                            {uploading ? (
                                <div className="p-16 bg-brand-beige/20 dark:bg-white/5 rounded-xl border-2 border-brand-border border-dashed text-center space-y-8">
                                    <div className="relative w-32 h-32 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-brand-border" />
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * uploadProgress) / 100} className="text-brand-emerald transition-all duration-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-brand-charcoal dark:text-white">{uploadProgress}%</div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em] animate-pulse">Uplink in Progress</p>
                                        <p className="text-xs font-bold text-brand-muted">Streaming data to secure archive node...</p>
                                    </div>
                                </div>
                            ) : uploadedUrl ? (
                                <div className="p-12 bg-brand-emerald/10 rounded-xl border-2 border-brand-emerald/20 flex flex-col items-center gap-8 text-center">
                                    <div className="w-20 h-20 bg-brand-emerald text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-brand-emerald/20"><CheckCircle2 size={40} /></div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Sync Established</h4>
                                        <p className="text-brand-muted font-medium text-xs truncate max-w-[300px]">{uploadedUrl}</p>
                                    </div>
                                    <button onClick={handleDeleteVideo} className="px-8 h-12 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">Redact Artifact</button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="p-16 bg-brand-beige/20 dark:bg-white/5 rounded-xl border-2 border-brand-border border-dashed text-center space-y-6 group-hover:border-brand-emerald group-hover:bg-brand-emerald/5 transition-all">
                                        <div className="w-20 h-20 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[24px] flex items-center justify-center mx-auto text-brand-muted group-hover:text-brand-emerald group-hover:scale-110 transition-all"><Plus size={40} /></div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Select Artifact</p>
                                            <p className="text-brand-muted font-medium text-xs">Recommended: MP4/WebM High Fidelity (Max 500MB)</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex gap-6">
                                <button onClick={() => setRecordingModal({ show: false, sessionId: null })} className="flex-1 h-20 bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-brand-charcoal hover:text-white transition-all border-none cursor-pointer">Cancel</button>
                                <button 
                                    disabled={!uploadedUrl || savingRecording} 
                                    onClick={handleSaveRecording}
                                    className="flex-[2] h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 border-none cursor-pointer"
                                >
                                    {savingRecording ? <Loader2 className="animate-spin mx-auto" /> : <>Commit to Archive <ChevronRight size={20} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <div className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-xl animate-fade-in" onClick={() => setEditModal({ show: false, session: null })}></div>
                    <div className="relative w-full max-w-4xl bg-white dark:bg-brand-charcoal rounded-[60px] border border-brand-border p-12 md:p-16 space-y-12 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-brand-border pb-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Settings className="text-brand-emerald" size={24} />
                                    <h2 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Session <span className="text-brand-emerald">Config</span></h2>
                                </div>
                                <p className="text-brand-muted font-medium">Modify operational parameters for this instructional broadcast.</p>
                            </div>
                            <button onClick={() => setEditModal({ show: false, session: null })} className="w-14 h-14 flex items-center justify-center bg-brand-beige/50 dark:bg-white/5 border-2 border-brand-border rounded-[20px] text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all cursor-pointer"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Session Title</label>
                                <input type="text" className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-base focus:border-brand-emerald transition-all" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Academic Course</label>
                                <select className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all appearance-none" value={editForm.course_id} onChange={e => setEditForm({...editForm, course_id: e.target.value})}>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Broadcast Date</label>
                                <input type="date" className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all" value={editForm.scheduled_date} onChange={e => setEditForm({...editForm, scheduled_date: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Start Time</label>
                                <input type="time" className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all" value={editForm.start_time} onChange={e => setEditForm({...editForm, start_time: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">End Time</label>
                                <input type="time" className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all" value={editForm.end_time} onChange={e => setEditForm({...editForm, end_time: e.target.value})} />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-brand-charcoal dark:text-white uppercase tracking-[0.2em] ml-2">Broadcast Link (URL)</label>
                                <input type="url" className="w-full h-18 px-8 bg-brand-beige/20 dark:bg-white/5 border-2 border-brand-border rounded-[24px] text-brand-charcoal dark:text-white outline-none font-bold text-sm focus:border-brand-emerald transition-all" placeholder="https://zoom.us/j/..." value={editForm.meeting_link} onChange={e => setEditForm({...editForm, meeting_link: e.target.value})} />
                            </div>
                        </div>

                        <div className="pt-8 flex gap-6">
                            <button onClick={() => setEditModal({ show: false, session: null })} className="flex-1 h-20 bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white rounded-[28px] font-black text-xs uppercase tracking-widest transition-all border-none cursor-pointer">Discard</button>
                            <button 
                                disabled={updating} 
                                onClick={handleUpdateSession}
                                className="flex-[2] h-20 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 border-none cursor-pointer"
                            >
                                {updating ? <Loader2 className="animate-spin mx-auto" /> : <>Save Modifications <ChevronRight size={20} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
