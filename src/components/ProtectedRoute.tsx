import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { userRole, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Determine where to redirect based on expected role context if possible, 
        // but generic login is safer or just default to student login for now?
        // User requested specific login pages. 
        // If we don't know the intent, maybe just /login (Student)
        return <Navigate to="/login" replace />;
    }

    if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if they perform a role mismatch
        switch (userRole) {
            case 'student': return <Navigate to="/student-dashboard" replace />;
            case 'instructor': return <Navigate to="/instructor-dashboard" replace />;
            case 'admin': return <Navigate to="/admin-dashboard" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
