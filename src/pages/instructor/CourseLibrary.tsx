import { useState, useEffect } from 'react';
import {
    Plus, Layers, Search, Filter, Edit2, Trash2, Loader2, AlertCircle,
    Video, Users, FileText, HelpCircle, UserCheck, Sparkles, BookOpen,
    ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CourseLibrary() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/courses`, {
                headers: { 
                    'Accept': 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });

            if (response.status === 401) {
                logout();
                navigate('/instructor-login');
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                const filtered = data.filter((c: any) => String(c.instructor_id) === String(user?.id));
                setCourses(filtered);
            } else {
                throw new Error(data.message || 'Synchronization failure.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchCourses();
    }, [user?.id]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Confirm permanent redaction of this curriculum artifact?')) return;
        
        try {
            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Accept': 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });

            if (response.ok) {
                setCourses(courses.filter(c => c.id !== id));
                toast.success('Artifact redacted');
            } else {
                toast.error('Failed to delete course');
            }
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-32 max-w-7xl mx-auto px-6 md:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-in-up">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-emerald/10 rounded-xl">
                            <BookOpen className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-[10px] uppercase tracking-[0.4em]">Syllabus Repository</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none uppercase">
                            Course <span className="text-brand-emerald">Library</span>
                        </h1>
                        <p className="text-brand-muted font-medium text-xl max-w-2xl leading-relaxed">
                            Design and orchestrate your master instructional pathways and digital curriculum assets within a centralized framework.
                        </p>
                    </div>
                </div>

                <Link
                    to="/instructor/course-library/create"
                    className="h-20 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-brand-charcoal/20 transition-all hover:scale-105 active:scale-95 group no-underline"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
                    Initialize Blueprint
                </Link>
            </header>

            {/* Filter Hub */}
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex-1 relative group">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search instructional blueprints..."
                        className="w-full h-20 pl-20 pr-8 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-[28px] focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-sm font-bold text-brand-charcoal dark:text-white placeholder:text-brand-muted/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <button className="h-20 px-10 bg-white dark:bg-white/5 border-2 border-brand-border rounded-[28px] flex items-center gap-6 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all">
                        Proficiency <Filter size={20} />
                    </button>
                    <button className="h-20 px-10 bg-white dark:bg-white/5 border-2 border-brand-border rounded-[28px] flex items-center gap-6 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all">
                        Sector <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-8 bg-brand-beige/20 dark:bg-white/5 rounded-[60px] border-2 border-brand-border border-dashed">
                        <Loader2 className="animate-spin text-brand-emerald" size={64} />
                        <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.4em] animate-pulse">Syncing Master Archive...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-[60px] p-20 text-center space-y-8 max-w-3xl mx-auto shadow-2xl">
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                            <AlertCircle size={48} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">Uplink Interrupted</h3>
                            <p className="text-brand-muted font-medium text-lg leading-relaxed">{error}</p>
                        </div>
                        <button 
                            onClick={fetchCourses} 
                            className="h-16 px-12 bg-red-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20"
                        >
                            Re-establish Connection
                        </button>
                    </div>
                ) : (
                    <>
                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredCourses.map((course, idx) => (
                                    <div key={course.id} className="group bg-white dark:bg-brand-charcoal rounded-[56px] border border-brand-border p-10 flex flex-col hover:shadow-[0_40px_80px_-20px_rgba(26,77,62,0.15)] transition-all duration-700 relative overflow-hidden animate-fade-in-up" 
                                         style={{ animationDelay: `${0.1 * idx}s` }}>
                                        {/* ... your card content remains the same ... */}
                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-emerald/5 rounded-full blur-3xl group-hover:bg-brand-emerald/10 transition-colors"></div>
                                       
                                        <div className="relative z-10 flex-1 space-y-10">
                                            {/* Category & Units */}
                                            <div className="flex justify-between items-start">
                                                <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border shadow-sm ${
                                                    course.category === 'live' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                    course.category === 'material' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                    course.category === 'quiz' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                                    'bg-brand-charcoal text-white border-transparent'
                                                }`}>
                                                    {course.category === 'live' ? <Users size={14} /> :
                                                     course.category === 'material' ? <FileText size={14} /> :
                                                     course.category === 'quiz' ? <HelpCircle size={14} /> : <Video size={14} />}
                                                    {course.category || 'Standard'}
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-beige/50 dark:bg-white/5 rounded-xl border border-brand-border text-[9px] font-black text-brand-muted uppercase tracking-widest group-hover:border-brand-emerald transition-colors">
                                                    <Layers size={14} className="text-brand-emerald" /> 
                                                    {course.modules?.length || 0} Units
                                                </div>
                                            </div>

                                            {/* Title & Description */}
                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-brand-charcoal dark:text-white tracking-tighter leading-none group-hover:text-brand-emerald transition-colors line-clamp-2 uppercase">
                                                    {course.title}
                                                </h3>
                                                <p className="text-brand-muted font-medium text-sm leading-relaxed line-clamp-3">
                                                    {course.description || 'Instructional design details currently processing for this curriculum artifact.'}
                                                </p>
                                            </div>

                                            {/* Active Cohorts */}
                                            <div className="flex items-center gap-6 pt-2">
                                                <div className="flex -space-x-3">
                                                    {[1,2,3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-brand-charcoal bg-brand-beige dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-brand-muted">
                                                            {i}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Active Cohorts</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-12 pt-10 border-t border-brand-border grid grid-cols-3 gap-4 relative z-10">
                                            <Link to={`/instructor/courses/${course.id}/edit`} className="h-14 flex items-center justify-center bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all no-underline shadow-xl shadow-brand-charcoal/20 group-hover:bg-brand-emerald">
                                                <Edit2 size={18} />
                                            </Link>
                                            <Link to={`/instructor/courses/${course.id}/certificate-design`} className="h-14 flex items-center justify-center bg-brand-beige dark:bg-white/10 text-brand-charcoal dark:text-white border-2 border-brand-border rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-brand-charcoal hover:text-white transition-all no-underline">
                                                <UserCheck size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="h-14 flex items-center justify-center bg-red-500/10 text-red-500 rounded-[20px] hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-brand-charcoal py-40 text-center rounded-[60px] border-2 border-brand-border border-dashed shadow-sm space-y-10">
                                <div className="w-32 h-32 bg-brand-beige dark:bg-white/5 rounded-[48px] flex items-center justify-center mx-auto text-brand-muted/30 group relative overflow-hidden">
                                    <Sparkles size={64} className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-brand-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none">The Library is Empty</h3>
                                    <p className="text-brand-muted font-medium text-lg max-w-md mx-auto">Your curriculum repository is waiting for its first instructional master-asset. Begin by initializing a new blueprint.</p>
                                </div>
                                <Link 
                                    to="/instructor/course-library/create" 
                                    className="inline-flex h-18 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] items-center gap-4 shadow-2xl shadow-brand-charcoal/20 no-underline hover:scale-105 transition-all"
                                >
                                    Initialize Master Course <ArrowRight size={20} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}