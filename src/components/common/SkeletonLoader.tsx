// Reusable skeleton loader components for the new Forest Green / Beige design system

interface SkeletonProps {
    className?: string;
}

const SkeletonPulse = ({ className = '' }: SkeletonProps) => (
    <div className={`animate-pulse bg-beige-200 dark:bg-charcoal-800 rounded-lg ${className}`} />
);

export const SkeletonText = ({ width = 'w-full', className = '' }: { width?: string; className?: string }) => (
    <SkeletonPulse className={`h-4 ${width} ${className}`} />
);

export const SkeletonCard = ({ className = '' }: SkeletonProps) => (
    <div className={`premium-card p-6 ${className}`}>
        <SkeletonPulse className="h-40 w-full rounded-xl mb-4" />
        <SkeletonText width="w-1/3" className="mb-3" />
        <SkeletonText className="mb-2" />
        <SkeletonText width="w-2/3" />
    </div>
);

export const SkeletonRow = ({ className = '' }: SkeletonProps) => (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
        <SkeletonPulse className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <SkeletonText width="w-1/3" />
            <SkeletonText width="w-1/2" />
        </div>
        <SkeletonPulse className="w-24 h-10 rounded-xl" />
    </div>
);

export const SkeletonDashboard = () => (
    <div className="space-y-10 p-4 lg:p-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <SkeletonText width="w-64" className="h-10" />
                <SkeletonText width="w-48" className="h-4" />
            </div>
        </div>

        {/* Content grid skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
                {/* Horizontal cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonPulse key={i} className="aspect-video rounded-premium" />
                    ))}
                </div>
                {/* List skeleton */}
                <div className="space-y-4">
                    <SkeletonText width="w-40" className="h-6" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4">
                            <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <SkeletonText width="w-32" />
                                <SkeletonText width="w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="w-full lg:w-80 space-y-8">
                <div className="premium-card p-6">
                    <SkeletonPulse className="w-16 h-16 rounded-full mb-4 mx-auto" />
                    <SkeletonText width="w-3/4" className="mx-auto" />
                </div>
                <div className="space-y-4">
                    <SkeletonPulse className="h-20 w-full rounded-2xl" />
                    <SkeletonPulse className="h-20 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonCourseGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4 lg:p-8">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="premium-card">
                <SkeletonPulse className="aspect-[16/10] w-full rounded-none" />
                <div className="p-6 space-y-4">
                    <SkeletonText width="w-1/4" />
                    <SkeletonText width="w-3/4" className="h-6" />
                    <SkeletonText width="w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonAssignmentList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 lg:p-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="premium-card p-8 space-y-6">
                <SkeletonPulse className="w-10 h-10 rounded-xl" />
                <SkeletonText width="w-3/4" className="h-6" />
                <SkeletonText width="w-1/2" />
                <div className="flex gap-2">
                    <SkeletonPulse className="w-20 h-6 rounded-lg" />
                    <SkeletonPulse className="w-16 h-6 rounded-lg" />
                </div>
                <SkeletonPulse className="w-full h-12 rounded-2xl mt-4" />
            </div>
        ))}
    </div>
);




export const SkeletonLessonView = () => {
    return (
        <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto animate-pulse">
            
            {/* 1. Header & Breadcrumb Sync Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-beige-200 dark:border-charcoal-800 pb-6">
                <div className="space-y-3 flex-1">
                    {/* Simulated Module Label (e.g., "Module 3: Lesson Title") */}
                    <div className="flex items-center gap-2">
                        <SkeletonPulse className="w-4 h-4 rounded-md bg-beige-300 dark:bg-charcoal-700" />
                        <SkeletonText width="w-32" className="h-3 opacity-60" />
                    </div>
                    {/* Lesson Title footprint */}
                    <SkeletonText width="w-2/3" className="h-8 bg-beige-300 dark:bg-charcoal-700" />
                </div>

                {/* Back to Course Action Footprint */}
                <SkeletonPulse className="w-44 h-12 rounded-xl shrink-0" />
            </div>

            {/* 2. Interactive Main Learning Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Main Core Content Viewer (Video Frame / Document Viewport / Quiz Platform) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Main Frame Viewport (Mimicking standard 16:9 Premium Video or PDF Canvas footprint) */}
                    <div className="w-full aspect-[16/9] bg-beige-100 dark:bg-charcoal-900 rounded-2xl border border-beige-200 dark:border-charcoal-800 p-6 flex flex-col justify-between relative overflow-hidden">
                        
                        {/* Top Control Overlay Wireframe (Simulated Maximize/Minimize & Status Badges) */}
                        <div className="flex justify-between items-center w-full">
                            <SkeletonPulse className="w-28 h-6 rounded-lg bg-beige-200 dark:bg-charcoal-800" />
                            <SkeletonPulse className="w-8 h-8 rounded-lg bg-beige-200 dark:bg-charcoal-800" />
                        </div>

                        {/* Central Play/Load Icon Blueprint */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <SkeletonPulse className="w-16 h-16 rounded-full bg-beige-300/60 dark:bg-charcoal-700/60" />
                        </div>

                        {/* Bottom Controller Bar Blueprint */}
                        <div className="flex justify-between items-center w-full">
                            <SkeletonPulse className="w-1/3 h-3 rounded bg-beige-200 dark:bg-charcoal-800" />
                            <div className="flex gap-2">
                                <SkeletonPulse className="w-6 h-6 rounded bg-beige-200 dark:bg-charcoal-800" />
                                <SkeletonPulse className="w-6 h-6 rounded bg-beige-200 dark:bg-charcoal-800" />
                            </div>
                        </div>
                    </div>

                    {/* Meta Actions immediately beneath viewer (AI Interaction & Review triggers footprint) */}
                    <div className="flex items-center justify-between gap-4 p-4 premium-card bg-beige-50/50 dark:bg-charcoal-900/50 rounded-xl">
                        <div className="flex gap-3 flex-1">
                            <SkeletonPulse className="w-36 h-10 rounded-xl" /> {/* "View Lesson Guide" UI target */}
                            <SkeletonPulse className="w-40 h-10 rounded-xl" /> {/* "Ask AI Assistant" UI target */}
                        </div>
                        <SkeletonPulse className="w-12 h-10 rounded-xl" />
                    </div>

                    {/* Lesson Core Textual Information Block */}
                    <div className="space-y-3 pt-2">
                        <SkeletonText width="w-1/4" className="h-4" />
                        <SkeletonText width="w-full" className="h-3" />
                        <SkeletonText width="w-full" className="h-3" />
                        <SkeletonText width="w-5/6" className="h-3" />
                    </div>
                </div>

                {/* Right Side: Navigation Dashboard & Progress Utilities */}
                <div className="space-y-6">
                    
                    {/* Linear Navigation Control Blocks ("Next Lesson" / "Previous Lesson" preview triggers) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="premium-card p-4 flex flex-col gap-2 border border-beige-100 dark:border-charcoal-900">
                            <SkeletonText width="w-12" className="h-2 opacity-50" />
                            <SkeletonText width="w-full" className="h-4" />
                        </div>
                        <div className="premium-card p-4 flex flex-col gap-2 border border-beige-100 dark:border-charcoal-900">
                            <SkeletonText width="w-12" className="h-2 opacity-50" />
                            <SkeletonText width="w-full" className="h-4" />
                        </div>
                    </div>

                    {/* "Mark as Complete" Premium Button Blueprint */}
                    <SkeletonPulse className="w-full h-14 rounded-2xl bg-beige-300 dark:bg-charcoal-700" />

                    {/* Syllabus Context Component: Simulating current module sequence list */}
                    <div className="premium-card p-5 space-y-4 border border-beige-100 dark:border-charcoal-900">
                        <div className="flex items-center justify-between border-b border-beige-100 dark:border-charcoal-800 pb-3">
                            <SkeletonText width="w-32" className="h-4" />
                            <SkeletonPulse className="w-10 h-5 rounded-full" />
                        </div>
                        
                        {/* Iterating static placeholder block items for local curriculum tracks */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-1">
                                <SkeletonPulse className={`w-5 h-5 rounded-full ${i === 1 ? 'bg-[var(--color-brand-forest)] opacity-40' : ''}`} />
                                <div className="space-y-1.5 flex-1">
                                    <SkeletonText width={i === 1 ? "w-3/4" : "w-1/2"} className="h-3" />
                                    <SkeletonText width="w-16" className="h-2 opacity-50" />
                                </div>
                                <SkeletonPulse className="w-4 h-4 rounded" />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};




export const SkeletonCourseDetails = () => {
    return (
        <div className="space-y-10 pb-12 max-w-7xl mx-auto animate-pulse">
            
            {/* 1. Catalog Navigation Return Anchor */}
            <div className="flex items-center gap-2 mb-8">
                <SkeletonPulse className="w-4 h-4 rounded-md bg-beige-300 dark:bg-charcoal-700" />
                <SkeletonText width="w-28" className="h-3 opacity-60" />
            </div>

            {/* 2. Dual-Column Dynamic Meta Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                
                {/* Left Side: Course Context Details Block */}
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-3">
                        {/* Cohort Name Badge Placeholder */}
                        <SkeletonPulse className="w-24 h-6 rounded-lg bg-beige-300 dark:bg-charcoal-700" />
                        {/* Certificate Program Sub-label Tracker */}
                        <SkeletonText width="w-32" className="h-3 opacity-50" />
                    </div>
                    
                    {/* Course Title Footprint */}
                    <div className="space-y-2">
                        <SkeletonText width="w-11/12" className="h-12 md:h-16 bg-beige-300 dark:bg-charcoal-700" />
                        <SkeletonText width="w-2/3" className="h-12 md:h-16 bg-beige-300 dark:bg-charcoal-700" />
                    </div>

                    {/* Master Instructor Credentials Profile Wrapper */}
                    <div className="flex items-center gap-3 pt-2">
                        <SkeletonPulse className="w-8 h-8 rounded-full bg-beige-200 dark:bg-charcoal-800" />
                        <SkeletonText width="w-48" className="h-4" />
                    </div>
                </div>

                {/* Right Side: Global Mastery Status Sidebar Card (Certificates / Claims Tracking) */}
                <div className="premium-card p-8 border border-beige-200 dark:border-charcoal-800 min-w-full lg:min-w-[340px] space-y-6">
                    <div>
                        <SkeletonText width="w-36" className="h-3 opacity-50 mb-4" />
                        {/* Progress Metric Ring/Percent representation */}
                        <div className="flex items-end gap-2">
                            <SkeletonText width="w-20" className="h-10 bg-beige-300 dark:bg-charcoal-700" />
                            <SkeletonText width="w-10" className="h-4 opacity-60 pb-1" />
                        </div>
                    </div>
                    
                    {/* Dynamic Progress Slide Bar track line */}
                    <SkeletonPulse className="w-full h-2 rounded-full bg-beige-100 dark:bg-charcoal-900" />

                    {/* Certificate Action Footprint: Claims trigger or download block button footprint */}
                    <SkeletonPulse className="w-full h-12 rounded-2xl bg-beige-300 dark:bg-charcoal-700" />
                </div>
            </div>

            {/* 3. Deep Course Curriculum Details Grid Section (Module Accordion List) */}
            <div className="space-y-6 pt-6 border-t border-beige-200 dark:border-charcoal-800">
                {/* Curriculum Panel Head Label */}
                <div className="space-y-2">
                    <SkeletonText width="w-48" className="h-6" />
                    <SkeletonText width="w-32" className="h-4 opacity-50" />
                </div>

                {/* Course Modules Iteration Stack */}
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="premium-card p-6 border border-beige-100 dark:border-charcoal-900 space-y-4">
                            
                            {/* Module Accordion Head */}
                            <div className="flex justify-between items-center">
                                <div className="space-y-2 flex-1">
                                    <SkeletonText width="w-1/4" className="h-3 opacity-60" />
                                    <SkeletonText width="w-2/5" className="h-5 bg-beige-200 dark:bg-charcoal-800" />
                                </div>
                                <SkeletonPulse className="w-6 h-6 rounded-md" />
                            </div>

                            {/* Nested Lessons Items Footprint (Inside target module block container) */}
                            <div className="pt-2 space-y-3 pl-4 border-l-2 border-beige-200 dark:border-charcoal-800">
                                {Array.from({ length: 2 }).map((_, j) => (
                                    <div key={j} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3 flex-1">
                                            <SkeletonPulse className="w-5 h-5 rounded-md bg-beige-200 dark:bg-charcoal-800" />
                                            <SkeletonText width={j === 0 ? "w-1/3" : "w-1/2"} className="h-4" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <SkeletonText width="w-12" className="h-3 opacity-50" />
                                            <SkeletonPulse className="w-20 h-8 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
