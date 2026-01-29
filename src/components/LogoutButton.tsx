import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "" }: { className?: string }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium ${className}`}
            title="Sign Out"
        >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
        </button>
    );
};

export default LogoutButton;
