import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRoles }) => {
    const { user } = useAuth();

    if (!user.isAuthenticated) {
        console.log('User not authenticated'); // Debugging line
        return <Navigate to="/login" replace />;
    }

    if (!requiredRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;