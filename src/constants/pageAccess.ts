// Canonical registry of page_key -> nav/route metadata for the per-user
// page-permission system. Keys mirror layoslmsbackend/config/pages.php —
// keep both in sync.

export interface PageAccessEntry {
    key: string;
    label: string;
    /** Route path prefixes this page_key guards (checked with startsWith). */
    pathPrefixes: string[];
    group: 'instructor' | 'admin';
}

export const PAGE_ACCESS_REGISTRY: PageAccessEntry[] = [
    { key: 'dashboard', label: 'Dashboard', pathPrefixes: ['/instructor-dashboard', '/admin-dashboard'], group: 'instructor' },
    { key: 'cohorts', label: 'Cohorts', pathPrefixes: ['/instructor/cohorts'], group: 'instructor' },
    { key: 'courses', label: 'Courses', pathPrefixes: ['/instructor/course-library', '/instructor/courses'], group: 'instructor' },
    { key: 'students', label: 'Students', pathPrefixes: ['/instructor/students'], group: 'instructor' },
    { key: 'certificates', label: 'Certificates', pathPrefixes: ['/instructor/certificates'], group: 'instructor' },
    { key: 'assignments', label: 'Assignments', pathPrefixes: ['/instructor/assignments'], group: 'instructor' },
    { key: 'interviews', label: 'Interview', pathPrefixes: ['/instructor/interview'], group: 'instructor' },
    { key: 'live', label: 'Live Classes', pathPrefixes: ['/instructor/live'], group: 'instructor' },
    { key: 'channels', label: 'Channels', pathPrefixes: ['/instructor/channels'], group: 'instructor' },
    { key: 'reviews', label: 'Reviews', pathPrefixes: ['/instructor/reviews'], group: 'instructor' },
    { key: 'announcements', label: 'Announcements', pathPrefixes: ['/instructor/announcements'], group: 'instructor' },
    { key: 'activity-logs', label: 'Activity Logs', pathPrefixes: ['/instructor/activity-logs'], group: 'instructor' },
    { key: 'settings', label: 'Settings', pathPrefixes: ['/instructor/settings'], group: 'instructor' },
    { key: 'admin.instructors', label: 'Manage Instructors', pathPrefixes: ['/admin/instructors'], group: 'admin' },
    { key: 'admin.permissions', label: 'Manage Users & Permissions', pathPrefixes: ['/admin/users'], group: 'admin' },
];

export function pageKeyForPath(pathname: string): string | null {
    for (const entry of PAGE_ACCESS_REGISTRY) {
        if (entry.pathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
            return entry.key;
        }
    }
    return null;
}
