import React, { memo } from 'react';
import { Building2, UserPlus, CheckCircle2, ShieldCheck, Map, Clock, Loader2 } from 'lucide-react';
import type { Account, Activity } from '../../types';

interface RecruiterDashboardTabProps {
    vendors: Account[];
    activities: Activity[];
    loadingActivities: boolean;
    onDrillDown: (status?: string) => void;
}

const RecruiterDashboardTab = ({ vendors, activities, loadingActivities, onDrillDown }: RecruiterDashboardTabProps) => {
    const stats = [
        { label: 'Total Vendors', value: vendors.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', status: undefined },
        { label: 'New Leads', value: vendors.filter(v => v.status === 'New').length, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'New' },
        { label: 'Active', value: vendors.filter(v => v.status === 'Active').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', status: 'Active' },
        { label: 'Vetting', value: vendors.filter(v => v.status === 'Vetting').length, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', status: 'Vetting' },
        { label: 'Market Density', value: 'High', icon: Map, color: 'text-purple-600', bg: 'bg-purple-50', status: undefined },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => onDrillDown(stat.status)}
                        className={`bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3 transition-all ${stat.status || stat.label === 'Total Vendors' ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md active:scale-[0.98]' : ''}`}
                    >
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight">{stat.label}</p>
                            <p className="text-lg font-black text-slate-800 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" /> Network Activity
                </h3>
                {loadingActivities ? <Loader2 className="animate-spin text-slate-300 mx-auto" /> : (
                    <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-slate-50">
                        {activities.slice(0, 5).map((activity, idx) => (
                            <div key={activity.id || idx} className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full bg-white border border-slate-100 flex items-center justify-center z-10">
                                    <div className={`w-1.5 h-1.5 rounded-full ${activity.type === 'email' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                </div>
                                <div className="hover:bg-slate-50/50 p-2 rounded-lg transition-all text-xs">
                                    <p className="text-slate-700 font-medium">{activity.content}</p>
                                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                        <span className="text-indigo-500/70">{activity.createdBy}</span>
                                        <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(RecruiterDashboardTab);
