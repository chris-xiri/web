import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, Edit, Building2, Mail, Phone } from 'lucide-react';
import type { Account } from '../../types';

interface RecruiterAccountsTabProps {
    vendors: Account[];
    onAddVendor: () => void;
    onEditVendor: (vendor: Account, e: React.MouseEvent) => void;
    onUpdateStatus: (id: string, status: string) => void;
    onLaunchSequence: (id: string) => void;
}

const RecruiterAccountsTab = ({ vendors, onAddVendor, onEditVendor, onUpdateStatus, onLaunchSequence }: RecruiterAccountsTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[14px] font-bold text-slate-800">Provider Network</h3>
                <button
                    onClick={onAddVendor}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded text-[12px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={14} /> Add Vendor
                </button>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-white">
                        <tr className="text-[12px] font-semibold text-slate-500 uppercase tracking-tight shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                            <th className="px-3 py-1.5 border-b border-slate-200">Company</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Status</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Contact Details</th>
                            <th className="px-3 py-1.5 border-b border-slate-200">Quick Actions</th>
                            <th className="px-3 py-1.5 border-b border-slate-200 text-right pr-4">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vendors.map(vendor => (
                            <tr
                                key={vendor.id}
                                onClick={() => navigate(`/account/${vendor.id}`)}
                                className={`hover:bg-slate-50 cursor-pointer group transition-all border-l-4 ${vendor.status === 'Active' ? 'border-l-emerald-500' :
                                    vendor.status === 'Outreach' ? 'border-l-indigo-500' :
                                        vendor.status === 'Onboarding' ? 'border-l-emerald-400' :
                                            'border-l-transparent'
                                    }`}
                            >
                                <td className="px-3 py-1.5 align-top">
                                    <div className="font-bold text-slate-900 text-[13px] leading-tight mb-0.5">{vendor.name}</div>
                                    <div className="text-[11px] text-slate-500 font-medium whitespace-normal leading-relaxed">{vendor.trades?.[0]}</div>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                        vendor.status === 'Outreach' ? 'bg-indigo-100 text-indigo-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>{vendor.status || 'New'}</span>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] text-slate-600 whitespace-normal break-all leading-tight">{vendor.email}</span>
                                        <span className="text-[11px] text-slate-400 font-medium">{vendor.phone}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top">
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(vendor.status === 'New' || !vendor.status) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); vendor.id && onLaunchSequence(vendor.id); }}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-sm"
                                            >
                                                <Mail size={12} /> Launch
                                            </button>
                                        )}
                                        {vendor.status === 'Outreach' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); vendor.id && onUpdateStatus(vendor.id, 'Onboarding'); }}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all shadow-sm"
                                            >
                                                Mark Replied
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 align-top text-right pr-4">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="font-bold text-slate-700 text-[13px]">{vendor.rating?.toFixed(1) || '-'}</span>
                                        <button
                                            onClick={(e) => onEditVendor(vendor, e)}
                                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Edit size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(RecruiterAccountsTab);
