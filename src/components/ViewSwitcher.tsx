import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserPlus, ShieldCheck } from 'lucide-react';

const ViewSwitcher = () => {
    const { user, switchView } = useAuth();

    if (!user) return null;

    // Only visible to privileged roles
    const canSwitch = ['super_admin', 'facility_manager'].includes(user.role);
    if (!canSwitch) return null;

    const currentMode = user.viewMode || user.role;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-1 rounded-2xl shadow-2xl border border-slate-700/50 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 invisible group-hover:visible">
                <div className="flex flex-col p-1 gap-1">
                    <button
                        onClick={() => switchView('sales')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentMode === 'sales'
                                ? 'bg-xiri-accent text-white font-bold shadow-lg shadow-xiri-accent/20'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="text-sm font-medium">Sales View</span>
                    </button>

                    <button
                        onClick={() => switchView('recruiter')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentMode === 'recruiter'
                                ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <UserPlus size={18} />
                        <span className="text-sm font-medium">Recruiter View</span>
                    </button>

                    <button
                        onClick={() => switchView('auditor')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentMode === 'auditor'
                                ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <ShieldCheck size={18} />
                        <span className="text-sm font-medium">Ops View</span>
                    </button>
                </div>
            </div>

            {/* Floating Trigger Button */}
            <button className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 transition-all active:scale-95 group-hover:rounded-b-2xl group-hover:rounded-t-none">
                <Users size={24} />
            </button>
        </div>
    );
};

export default ViewSwitcher;
