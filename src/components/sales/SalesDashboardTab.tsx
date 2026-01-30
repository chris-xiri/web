import React, { memo } from 'react';
import { Building2, UserPlus, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Account } from '../../types';

interface SalesDashboardTabProps {
    prospects: Account[];
    onDrillDown: (status?: string) => void;
}

const SalesDashboardTab = ({ prospects, onDrillDown }: SalesDashboardTabProps) => {
    const stats = [
        { label: 'Total Prospects', value: prospects.length, icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50', status: undefined },
        { label: 'New Targets', value: prospects.filter(v => v.status === 'New').length, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50', status: 'New' },
        { label: 'Won Deals', value: prospects.filter(v => v.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'Active' },
        { label: 'In Negotiation', value: prospects.filter(v => v.status === 'Vetting').length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', status: 'Vetting' },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => onDrillDown(stat.status)}
                        className={`bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center gap-3 transition-all ${stat.status || stat.label === 'Total Prospects' ? 'cursor-pointer hover:border-sky-400 hover:shadow-md active:scale-[0.98]' : ''}`}
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
        </div>
    );
};

export default memo(SalesDashboardTab);
