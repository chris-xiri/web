import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Clock, Star } from 'lucide-react';
import type { Account } from '../../types';

interface RecruiterPipelineTabProps {
    vendors: Account[];
    onUpdateStatus: (id: string, status: string) => void;
    onLaunchSequence: (id: string) => void;
}

const RecruiterPipelineTab = ({ vendors, onUpdateStatus, onLaunchSequence }: RecruiterPipelineTabProps) => {
    const navigate = useNavigate();
    const columns = [
        { id: 'New', label: 'New Leads', color: 'bg-blue-500' },
        { id: 'Outreach', label: 'In Sequence', color: 'bg-indigo-500' },
        { id: 'Onboarding', label: 'Replied', color: 'bg-emerald-500' },
        { id: 'Vetting', label: 'Vetting', color: 'bg-amber-500' },
        { id: 'Active', label: 'Active', color: 'bg-blue-600' }
    ];

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-180px)] select-none">
            {columns.map(col => {
                const stageVendors = vendors.filter(v => (v.status || 'New') === col.id);
                return (
                    <div key={col.id} className="min-w-[240px] max-w-[280px] flex-1 bg-slate-100/50 rounded border border-slate-200 flex flex-col h-full">
                        <div className="flex justify-between items-center px-2.5 py-2 border-b border-slate-200 bg-white/50">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                                <h3 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{col.label}</h3>
                            </div>
                            <span className="bg-slate-200/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">{stageVendors.length}</span>
                        </div>
                        <div className="p-2 space-y-2 overflow-y-auto flex-1 scrollbar-thin">
                            {stageVendors.map(vendor => (
                                <div key={vendor.id} className={`bg-white p-2.5 rounded shadow-sm border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer group border-t-2 ${vendor.status === 'Active' ? 'border-t-emerald-500' :
                                    vendor.status === 'New' || !vendor.status ? 'border-t-blue-500' :
                                        vendor.status === 'Vetting' ? 'border-t-amber-500' :
                                            vendor.status === 'Outreach' ? 'border-t-indigo-500' :
                                                'border-t-slate-300'
                                    }`} onClick={() => navigate(`/account/${vendor.id}`)}>
                                    <h4 className="font-bold text-slate-900 text-[12px] leading-tight mb-1 whitespace-normal break-words">{vendor.name}</h4>
                                    <div className="flex gap-1 mb-2">
                                        {vendor.trades?.[0] && <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{vendor.trades[0]}</div>}
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        {col.id === 'New' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); vendor.id && onLaunchSequence(vendor.id); }}
                                                className="w-full mt-1 mb-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <Mail size={12} /> Launch Sequence
                                            </button>
                                        )}

                                        {col.id === 'Outreach' && (
                                            <>
                                                {vendor.outreach && (
                                                    <div className="mb-2 bg-indigo-50/50 p-1.5 rounded border border-indigo-100 flex justify-between items-center">
                                                        <span className="text-[9px] font-bold text-indigo-700 uppercase">Step {vendor.outreach.step}/3</span>
                                                        <span className="text-[9px] text-indigo-500 font-medium flex items-center gap-1"><Clock size={8} /> {vendor.outreach.nextEmailAt ? new Date(vendor.outreach.nextEmailAt).toLocaleDateString() : 'Pending'}</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); vendor.id && onUpdateStatus(vendor.id, 'Onboarding'); }}
                                                    className="w-full mt-1 mb-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all shadow-sm"
                                                >
                                                    Mark Replied
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-50">
                                        <div className="flex gap-2 text-slate-300"><Phone size={11} /><Mail size={11} /></div>
                                        <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500"><Star size={10} fill="currentColor" />{vendor.rating?.toFixed(1) || '-'}</div>
                                    </div>
                                </div>
                            ))}
                            {stageVendors.length === 0 && (
                                <div className="text-center py-6 text-slate-300 text-[10px] font-bold uppercase border-2 border-dashed border-slate-200 rounded">
                                    No data
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default memo(RecruiterPipelineTab);
