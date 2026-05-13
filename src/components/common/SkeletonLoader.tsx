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
