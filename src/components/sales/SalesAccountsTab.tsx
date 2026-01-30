import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Mail, Phone, Edit } from 'lucide-react';
import type { Account } from '../../types';

interface SalesAccountsTabProps {
    prospects: Account[];
    onAddProspect: () => void;
    onEditProspect: (prospect: Account, e: React.MouseEvent) => void;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

const SalesAccountsTab = ({ prospects, onAddProspect, onEditProspect, onUpdateStatus }: SalesAccountsTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[14px] font-bold text-slate-800">All Prospects</h3>
                <button
                    onClick={onAddProspect}
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white rounded text-[12px] font-semibold hover:bg-sky-700 transition-all shadow-sm"
                >
                    <Plus size={14} /> Add Prospect
                </button>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="text-[12px] font-semibold text-slate-500 uppercase tracking-tight shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                            <th className="px-3 py-1.5 border-b border-slate-200">Company</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Status</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Location</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Contact</th>
                            <th className="px-3 py-1.5 border-b border-slate-200 text-center">Quick Action</th>
                            <th className="px-3 py-1.5 border-b border-slate-200 text-right pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {prospects.filter(p => p.status !== 'Rejected').map((prospect) => (
                            <tr
                                key={prospect.id}
                                onClick={() => navigate(`/account/${prospect.id}`)}
                                className={`hover:bg-slate-50 cursor-pointer group transition-all border-l-4 ${prospect.status === 'Active' ? 'border-l-emerald-500' :
                                    prospect.status === 'Vetting' ? 'border-l-amber-500' :
                                        prospect.status === 'New' ? 'border-l-blue-500' :
                                            'border-l-transparent'
                                    }`}
                            >
                                <td className="px-3 py-1.5 align-top">
                                    <div className="font-bold text-slate-900 text-[13px] leading-tight mb-0.5">{prospect.name}</div>
                                    <div className="text-[11px] text-slate-500 font-medium whitespace-normal leading-relaxed">
                                        {prospect.industry || 'Unknown Industry'}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                                        ${prospect.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                            prospect.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                                prospect.status === 'Vetting' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'}`}>
                                        {prospect.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <div className="text-[13px] text-slate-600 flex items-center gap-1.5 whitespace-normal leading-tight">
                                        <MapPin size={10} className="text-slate-300 flex-shrink-0" />
                                        <span>{prospect.address?.city ? `${prospect.address.city}, ${prospect.address.state}` : prospect.address?.zipCode || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <div className="text-[12px] text-slate-600 flex flex-col gap-0.5 whitespace-normal leading-tight">
                                        {prospect.email && <div className="flex items-center gap-1.5"><Mail size={10} className="text-slate-300 flex-shrink-0" /> <span className="break-all">{prospect.email}</span></div>}
                                        {prospect.phone && <div className="flex items-center gap-1.5"><Phone size={10} className="text-slate-300 flex-shrink-0" /> {prospect.phone}</div>}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top text-center">
                                    <div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(prospect.status === 'New' || !prospect.status) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); prospect.id && onUpdateStatus(prospect.id, 'Vetting'); }}
                                                className="px-2 py-0.5 bg-sky-600 text-white rounded text-[10px] font-bold uppercase hover:bg-sky-700 transition-all shadow-sm"
                                            >
                                                Vetting
                                            </button>
                                        )}
                                        {prospect.status === 'Vetting' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); prospect.id && onUpdateStatus(prospect.id, 'Active'); }}
                                                className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all shadow-sm"
                                            >
                                                Win
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top text-right pr-4">
                                    <button
                                        onClick={(e) => onEditProspect(prospect, e)}
                                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-sky-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(SalesAccountsTab);
