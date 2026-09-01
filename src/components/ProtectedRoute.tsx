import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pageKeyForPath } from '../constants/pageAccess';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { userRole, isAuthenticated, hasPageAccess } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Determine where to redirect based on expected role context if possible,
        // but generic login is safer or just default to student login for now?
        // User requested specific login pages.
        // If we don't know the intent, maybe just /login (Student)
        return <Navigate to="/login" replace />;
    }

    const dashboardForRole = () => {
        switch (userRole) {
            case 'student': return '/student-dashboard';
            case 'instructor': return '/instructor-dashboard';
            case 'admin': return '/admin-dashboard';
            default: return '/login';
        }
    };

    if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if they perform a role mismatch
        return <Navigate to={dashboardForRole()} replace />;
    }

    const pageKey = pageKeyForPath(location.pathname);
    if (!hasPageAccess(pageKey)) {
        return <Navigate to={dashboardForRole()} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
