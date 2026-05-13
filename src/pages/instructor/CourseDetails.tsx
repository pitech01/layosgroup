import { useState } from 'react';
import {
    Plus,
    Video,
    Users,
    FileText,
    GripVertical,
    Edit3,
    Calendar,
    TrendingUp,
    ShieldCheck,
    Settings,
    Activity,
    Layers,
    ChevronDown,
    ChevronRight,
    Search,
    BookOpen,
    Sparkles,
    Target,
    BarChart3,
    ArrowRight,
    Clock,
    Lock
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

interface Session {
    id: string;
    title: string;
    type: 'video' | 'live' | 'material' | 'quiz';
    duration?: string;
    time?: string;
    platform?: string;
    format?: string;
    status: 'completed' | 'ongoing' | 'upcoming';
}

interface Module {
    id: string;
    title: string;
    sessions: Session[];
}

interface CourseBlueprint {
    id: string;
    title: string;
    description: string;
    modules: Module[];
    isExpanded?: boolean;
}

export default function CourseDetails() {
    const { id: cohortCode } = useParams();
    const [activeTab, setActiveTab] = useState('roadmap');
    const [searchQuery, setSearchQuery] = useState('');

    const isCompleted = cohortCode?.includes('2025');

    const [cohort] = useState({
        code: cohortCode || "WL-JAN-2026",
        status: isCompleted ? "Completed" : "Active",
        students: isCompleted ? 210 : 124,
        capacity: isCompleted ? 210 : 150,
        retention: isCompleted ? "88%" : "94%",
        revenue: isCompleted ? "$42,100.00" : "$24,676.00",
        launchDate: isCompleted ? "Oct 01, 2025" : "Jan 15, 2026",
        endDate: isCompleted ? "Dec 15, 2025" : "Mar 20, 2026"
    });

    const [assignedCourses, setAssignedCourses] = useState<CourseBlueprint[]>([
        {
            id: 'cb1',
            title: "Executive Brand Systems",
            description: "Master the logic of premium brand architecture and visual systems.",
            isExpanded: true,
            modules: [
                {
                    id: 'm1',
                    title: 'Phase 1: Foundations of Branding',
                    sessions: [
                        { id: 's1', title: 'Why Brand Identity Matters', type: 'video', duration: '12:45', status: 'completed' },
                        { id: 's2', title: 'Defining Your Brand Voice', type: 'video', duration: '15:20', status: 'completed' },
                    ]
                }
            ]
        },
        {
            id: 'cb2',
            title: "Digital Market Dominance",
            description: "Strategic frameworks for market positioning and high-conversion growth.",
            isExpanded: false,
            modules: [
                {
                    id: 'm2',
                    title: 'Module A: Market Psycho-analysis',
                    sessions: [
                        { id: 's3', title: 'Behavioral Funnels', type: 'material', format: 'Interactive Deck', status: 'upcoming' }
                    ]
                }
            ]
        }
    ]);

    const toggleCourseExpansion = (id: string) => {
        setAssignedCourses(assignedCourses.map(c =>
            c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
        ));
    };

    const handleAddCourse = () => {
        const newCourse: CourseBlueprint = {
            id: `cb_${Date.now()}`,
            title: "New Strategic Blueprint",
            description: "Define the core objectives for this new educational unit.",
            isExpanded: true,
            modules: []
        };
        setAssignedCourses([...assignedCourses, newCourse]);
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-fade-in-up">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${cohort.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-brand-beige dark:bg-white/10 text-brand-muted border-brand-border'}`}>
                            {cohort.status}
                        </div>
                        <div className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-emerald/20">
                            {cohort.code}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            <Calendar size={14} className="text-brand-emerald" /> {cohort.launchDate} — {cohort.endDate}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight uppercase">Cohort <span className="text-brand-emerald">Console</span></h1>
                        <p className="text-brand-muted font-medium text-lg leading-relaxed">Orchestrating {assignedCourses.length} Assigned Curriculums for this operational cycle.</p>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none h-14 px-8 bg-brand-beige dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border-none cursor-pointer hover:bg-brand-charcoal hover:text-white dark:hover:bg-brand-emerald transition-all shadow-sm">
                        <Settings size={18} /> Settings
                    </button>
                    <button 
                        onClick={handleAddCourse}
                        className="flex-1 md:flex-none h-14 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 border-none cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} /> Assign Blueprint
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex gap-12 border-b border-brand-border px-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {[
                    { id: 'roadmap', label: 'Course Curriculum', icon: Layers },
                    { id: 'students', label: 'Enrollment List', icon: Users },
                    { id: 'performance', label: 'Performance Metrics', icon: BarChart3 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 pb-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-none cursor-pointer relative ${activeTab === tab.id ? 'text-brand-emerald' : 'text-brand-muted hover:text-brand-charcoal dark:hover:text-white'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-emerald rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {activeTab === 'roadmap' && (
                    <div className="space-y-12">
                        {/* Roadmap Controls */}
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                            <div className="w-full lg:max-w-md relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                    <Search size={22} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search blueprint architecture..."
                                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-brand-charcoal border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full lg:w-auto">
                                <button className="flex-1 lg:flex-none h-16 px-8 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer shadow-sm">
                                    <Calendar size={18} /> Schedule
                                </button>
                                <button className="flex-1 lg:flex-none h-16 px-8 bg-brand-beige dark:bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal dark:hover:text-white transition-all border-none cursor-pointer shadow-sm">
                                    <Activity size={18} /> Content Drip
                                </button>
                            </div>
                        </div>

                        {/* Courses Grid */}
                        <div className="space-y-8">
                            {assignedCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map((course) => (
                                <div key={course.id} className={`bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden transition-all duration-500 ${course.isExpanded ? 'shadow-2xl shadow-brand-charcoal/5 ring-1 ring-brand-emerald/20' : 'shadow-sm opacity-90 hover:opacity-100'}`}>
                                    {/* Course Header */}
                                    <div 
                                        className="flex flex-col md:flex-row items-center justify-between p-8 md:p-10 cursor-pointer select-none gap-8"
                                        onClick={() => toggleCourseExpansion(course.id)}
                                    >
                                        <div className="flex items-center gap-8 flex-1">
                                            <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-[20px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                <BookOpen size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight leading-none group-hover:text-brand-emerald transition-colors">{course.title}</h3>
                                                <p className="text-brand-muted font-medium text-sm line-clamp-1">{course.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12 w-full md:w-auto border-t md:border-t-0 border-brand-border pt-6 md:pt-0">
                                            <div className="text-right space-y-1">
                                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Mastery Level</span>
                                                <h4 className="text-xl font-black text-brand-emerald leading-none">68% <span className="text-xs text-brand-muted font-bold tracking-normal uppercase">Avg.</span></h4>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl bg-brand-beige dark:bg-white/10 flex items-center justify-center text-brand-muted transition-transform duration-500 ${course.isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Content */}
                                    {course.isExpanded && (
                                        <div className="px-8 md:px-10 pb-10 space-y-8 animate-fade-in-up">
                                            <div className="border-t border-brand-border pt-10">
                                                {course.modules.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-20 gap-8 bg-brand-beige/20 dark:bg-white/5 rounded-[40px] border-2 border-brand-border border-dashed text-center">
                                                        <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center text-brand-muted/30">
                                                            <Sparkles size={40} />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <p className="text-brand-muted font-black text-xs uppercase tracking-widest">No curriculum architecture defined.</p>
                                                            <Link to={`/instructor/curriculum/${course.id}`} className="h-14 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 no-underline shadow-xl shadow-brand-charcoal/20">
                                                                Initiate Curriculum Builder <ArrowRight size={18} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-10">
                                                        {course.modules.map((mod) => (
                                                            <div key={mod.id} className="bg-brand-beige/10 dark:bg-white/5 rounded-[32px] border border-brand-border overflow-hidden">
                                                                <div className="px-8 py-6 bg-white dark:bg-brand-charcoal/50 border-b border-brand-border flex justify-between items-center">
                                                                    <div className="flex items-center gap-4">
                                                                        <GripVertical size={20} className="text-brand-muted" />
                                                                        <h4 className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-[0.15em]">{mod.title}</h4>
                                                                    </div>
                                                                    <button className="w-10 h-10 bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-emerald rounded-xl flex items-center justify-center transition-all border-none cursor-pointer">
                                                                        <Edit3 size={16} />
                                                                    </button>
                                                                </div>
                                                                <div className="divide-y divide-brand-border/50">
                                                                    {mod.sessions.map((sess) => (
                                                                        <div key={sess.id} className="px-8 py-6 flex flex-col md:flex-row items-center gap-8 hover:bg-white dark:hover:bg-brand-charcoal/30 transition-colors group/row">
                                                                            <div className={`
                                                                                w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover/row:scale-110 transition-transform duration-500
                                                                                ${sess.type === 'video' ? 'bg-blue-500/10 text-blue-600' : 
                                                                                  sess.type === 'live' ? 'bg-red-500/10 text-red-600' : 
                                                                                  sess.type === 'material' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}
                                                                            `}>
                                                                                {sess.type === 'video' && <Video size={24} />}
                                                                                {sess.type === 'live' && <Activity size={24} />}
                                                                                {sess.type === 'material' && <FileText size={24} />}
                                                                            </div>
                                                                            <div className="flex-1 space-y-1 text-center md:text-left w-full md:w-auto">
                                                                                <h5 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{sess.title}</h5>
                                                                                <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                                                                    <span>{sess.type}</span>
                                                                                    <span className="w-1 h-1 bg-brand-muted/30 rounded-full"></span>
                                                                                    <span>{sess.duration || sess.format || sess.time}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                                                <button className="h-11 w-11 flex items-center justify-center bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-charcoal dark:hover:text-white rounded-xl transition-all border-none cursor-pointer">
                                                                                    <Settings size={18} />
                                                                                </button>
                                                                                <button className="h-11 w-11 flex items-center justify-center bg-brand-beige dark:bg-white/10 text-brand-muted hover:text-brand-emerald rounded-xl transition-all border-none cursor-pointer">
                                                                                    <ShieldCheck size={18} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="p-6 bg-brand-beige/20 dark:bg-white/5 flex justify-center">
                                                                    <button className="flex items-center gap-3 text-xs font-black text-brand-emerald uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer bg-transparent">
                                                                        <Plus size={18} /> Extend Unit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="pt-8 flex justify-center">
                                                            <Link to={`/instructor/curriculum/${course.id}`} className="h-16 px-12 bg-white dark:bg-brand-charcoal border-2 border-brand-border border-dashed rounded-[32px] font-black text-xs uppercase tracking-widest text-brand-muted hover:text-brand-emerald hover:border-brand-emerald transition-all flex items-center gap-4 no-underline">
                                                                <Edit3 size={20} /> Full Curriculum Engineering Console
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border p-20 text-center space-y-8 animate-fade-in-up">
                        <div className="w-24 h-24 bg-brand-beige dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-brand-muted/30">
                            <Users size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Enrollment Manifest</h3>
                            <p className="text-brand-muted font-medium max-w-md mx-auto">Access the detailed directory of cadets currently synchronized with this operational cycle.</p>
                        </div>
                        <button className="h-14 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 mx-auto shadow-xl shadow-brand-charcoal/20 border-none cursor-pointer">
                            Sync Directory <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
