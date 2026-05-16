import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, BookOpen, ArrowLeft, Layers, Loader2, Sparkles, LayoutGrid, Search } from 'lucide-react';

const Courses = () => {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCohort, setSelectedCohort] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    const mappedEnrolled = data.cohorts.map((c: any) => {
                        const allCourseLessons = c.course.modules?.flatMap((m: any) => m.lessons) || [];
                        const docLessons = allCourseLessons.filter((l: any) => l.file_url);
                        const effectiveLessons = docLessons.length > 0 ? docLessons : allCourseLessons;
                        const completedLessonsInCourseCount = data.completed_lessons?.filter((cl: any) => 
                            effectiveLessons.some((el: any) => el.id === cl.id)
                        ).length || 0;

                        return {
                            id: c.id,
                            name: c.name,
                            isEnrolled: true,
                            courses: c.course ? [{
                                id: c.course.id,
                                title: c.course.title,
                                instructor: c.instructor?.name || 'Assigned Instructor',
                                thumbnail: c.course.thumbnail || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                                progress: c.pivot.progress || 0,
                                totalLessons: effectiveLessons.length,
                                completedLessons: completedLessonsInCourseCount,
                            }] : []
                        };
                    });
                    setCohorts(mappedEnrolled);
                }
            } catch (err) {
                console.error("Fetch Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL, token]);

    // Filter cohorts based on query (checks cohort name and containing course titles)
    const filteredCohorts = cohorts.filter(cohort => 
        cohort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cohort.courses.some((course: any) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Filter courses within the selected cohort based on query
    const filteredCourses = selectedCohort?.courses.filter((course: any) => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-brand-emerald" size={40} />
                <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em] animate-pulse">Syncing Curriculums...</p>
            </div>
        );
    }

    if (!selectedCohort) {
        return (
            <div className="space-y-12 pb-12">
                {/* Header Section */}
                <header className="max-w-3xl animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Sparkles className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Student Portal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight mb-4">
                        Academic <span className="text-brand-emerald">Cohorts</span>
                    </h1>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">
                        Navigate through your active learning cohorts. Each cohort represents a dedicated path towards mastering your professional curriculum.
                    </p>
                </header>

                {/* Search Bar Container */}
                {cohorts.length > 0 && (
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search cohorts or courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl text-brand-charcoal dark:text-white placeholder-brand-muted focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {cohorts.length > 0 ? (
                        filteredCohorts.length > 0 ? (
                            filteredCohorts.map(cohort => (
                                <div 
                                    key={cohort.id} 
                                    className="bg-white dark:bg-brand-charcoal p-8 rounded-xl border border-brand-border flex flex-col h-full cursor-pointer group hover:shadow-2xl hover:shadow-brand-emerald/10 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                                    onClick={() => {
                                        setSelectedCohort(cohort);
                                        setSearchQuery(''); // Reset search query on screen navigation
                                    }}
                                >
                                    {/* Decorative background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 rounded-bl-[100px] transition-transform group-hover:scale-125" />

                                    <div className="flex justify-between items-start mb-10 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-brand-beige dark:bg-white/5 text-brand-emerald flex items-center justify-center shadow-inner border border-brand-border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                            <Users size={32} />
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full text-[10px] font-black bg-brand-emerald/10 text-brand-emerald uppercase tracking-widest border border-brand-emerald/20">
                                            Active Path
                                        </div>
                                    </div>
                                    
                                    <div className="mb-10 relative z-10">
                                        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-2">
                                            Cohort Identifier: 00{cohort.id}
                                        </div>
                                        <h3 className="text-2xl font-black text-brand-charcoal dark:text-white leading-tight tracking-tight group-hover:text-brand-emerald transition-colors">
                                            {cohort.name}
                                        </h3>
                                    </div>
                                    
                                    <div className="mt-auto pt-8 border-t border-brand-border flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3 text-brand-muted text-xs font-black uppercase tracking-widest">
                                            <BookOpen size={16} className="text-brand-emerald" /> 
                                            {cohort.courses.length} {cohort.courses.length > 1 ? "Courses" : "Course"} 
                                        </div>
                                        <div className="bg-brand-charcoal dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center text-white dark:text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white transition-all">
                                            <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Search Empty State */
                            <div className="col-span-full py-16 text-center">
                                <p className="text-brand-muted font-medium">No cohorts matches your search parameters.</p>
                            </div>
                        )
                    ) : (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl shadow-sm">
                            <div className="w-20 h-20 bg-brand-beige dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-muted/30">
                                <LayoutGrid size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-brand-charcoal dark:text-white mb-3">
                                No Active Assignments
                            </h3>
                            <p className="text-brand-muted font-medium max-w-md mx-auto">
                                You haven't been assigned to any cohorts yet. Please coordinate with your instructor for registration.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <button 
                onClick={() => {
                    setSelectedCohort(null);
                    setSearchQuery(''); // Reset search query on screen navigation
                }} 
                className="inline-flex items-center gap-2 text-brand-muted font-black text-xs uppercase tracking-widest hover:text-brand-emerald transition-colors group bg-transparent border-none cursor-pointer mb-4"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Return to Cohorts</span>
            </button>

            <header className="mb-6 border-b border-brand-border pb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-brand-emerald text-white px-4 py-1.5 rounded-full shadow-lg shadow-brand-emerald/20">
                        Cohort #{selectedCohort.id}
                    </div>
                    <span className="text-brand-muted font-black text-[10px] uppercase tracking-widest">Curriculum Details</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight">
                    {selectedCohort.name}
                </h1>
            </header>

            {/* Search Bar Container */}
            {selectedCohort.courses.length > 0 && (
                <div className="relative max-w-md w-full mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses or instructors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-charcoal border border-brand-border rounded-xl text-brand-charcoal dark:text-white placeholder-brand-muted focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all font-medium text-sm shadow-sm"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course: any) => {
                        const progress = course.progress || 0;
                        const isCompleted = progress === 100;
                        const isStarted = progress > 0;

                        return (
                            <div 
                                key={course.id} 
                                className="bg-white dark:bg-brand-charcoal rounded-xl border border-brand-border overflow-hidden flex flex-col h-full shadow-sm hover:shadow-2xl transition-all duration-500 group"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-transparent" />
                                    <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl backdrop-blur-md ${
                                        isCompleted ? 'bg-emerald-500 text-white' : 
                                        isStarted ? 'bg-indigo-500 text-white' : 'bg-white/90 text-brand-charcoal'
                                    } uppercase tracking-widest border border-white/20`}>
                                        {isCompleted ? 'Finished' : isStarted ? 'In Progress' : 'Ready to Start'}
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">
                                            Instructor: {course.instructor}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-2xl font-black text-brand-charcoal dark:text-white mb-8 leading-snug tracking-tight line-clamp-2">
                                        {course.title}
                                    </h3>

                                    <div className="mb-10 mt-auto">
                                        <div className="flex justify-between text-[10px] font-black text-brand-muted mb-3 uppercase tracking-widest">
                                            <span>{progress}% Mastery</span>
                                            <span>{course.completedLessons}/{course.totalLessons} Units</span>
                                        </div>
                                        <div className="w-full bg-brand-beige dark:bg-white/5 h-2 rounded-full overflow-hidden border border-brand-border">
                                            <div
                                                className="bg-brand-emerald h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link
                                        to={`/student/courses/${course.id}?cohortId=${selectedCohort.id}`}
                                        className="flex items-center justify-center gap-4 bg-brand-charcoal dark:bg-brand-emerald text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 transition-all hover:-translate-y-1 active:scale-95 group-hover:shadow-2xl"
                                    >
                                        {isStarted ? 'Continue Learning' : 'Begin Module'}
                                        <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Search Empty State */
                    <div className="col-span-full py-16 text-center">
                        <p className="text-brand-muted font-medium">No courses match your search criteria inside this cohort.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;