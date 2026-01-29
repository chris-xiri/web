import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    // --- RBAC + View Mode Logic ---
    let hasAccess = false;

    if (!allowedRoles) {
        hasAccess = true; // No specific role required, just authentication
    } else {
        // 1. Direct Role Match
        if (allowedRoles.includes(user.role)) {
            hasAccess = true;
        }

        // 2. View Mode Override (for facility_manager / super_admin)
        if (user.viewMode && allowedRoles.includes(user.viewMode as any)) {
            hasAccess = true;
        }

        // 3. Super Admin Universal Access
        if (user.role === 'super_admin') {
            hasAccess = true;
        }
    }

    if (!hasAccess) {
        // Redirect to a safe default based on their actual role
        if (user.role === 'sales') return <Navigate to="/sales" replace />;
        if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />;
        if (user.role === 'auditor') return <Navigate to="/audit" replace />;
        if (user.role === 'facility_manager') return <Navigate to="/audit" replace />; // Default to Ops view
        return <Navigate to="/audit" replace />; // Fallback
    }

    return <Outlet />;
};

export default ProtectedRoute;
