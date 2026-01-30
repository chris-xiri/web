import React, { memo } from 'react';

import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Star } from 'lucide-react';
import type { Account } from '../../types';

interface SalesPipelineTabProps {
    prospects: Account[];
    handleDragStart: (e: React.DragEvent, id: string) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, newStatus: string) => void;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

const SalesPipelineTab = ({ prospects, handleDragStart, handleDragOver, handleDrop, onUpdateStatus }: SalesPipelineTabProps) => {
    const navigate = useNavigate();
    const stages = ['New', 'Contacted', 'Vetting', 'Active', 'Rejected'];

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-180px)] select-none">
            {stages.map(stage => {
                const stageProspects = prospects.filter(p => (p.status || 'New') === stage);
                return (
                    <div
                        key={stage}
                        className="min-w-[240px] max-w-[280px] flex-1 bg-slate-100/50 rounded border border-slate-200 flex flex-col h-full"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                    >
                        <div className="flex justify-between items-center px-2.5 py-2 border-b border-slate-200 bg-white/50">
                            <h3 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{stage}</h3>
                            <span className="bg-slate-200/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">{stageProspects.length}</span>
                        </div>
                        <div className="p-2 space-y-2 overflow-y-auto flex-1 scrollbar-thin">
                            {stageProspects.map(prospect => (
                                <div
                                    key={prospect.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, prospect.id!)}
                                    className={`bg-white p-2.5 rounded shadow-sm border border-slate-200 hover:border-sky-400 transition-all cursor-grab active:cursor-grabbing group relative border-t-2 ${prospect.status === 'Active' ? 'border-t-emerald-500' :
                                        prospect.status === 'New' || !prospect.status ? 'border-t-blue-500' :
                                            prospect.status === 'Vetting' ? 'border-t-amber-500' :
                                                'border-t-slate-300'
                                        }`}
                                    onClick={() => navigate(`/account/${prospect.id}`)}
                                >
                                    <h4 className="font-bold text-slate-900 text-[12px] leading-tight mb-1 whitespace-normal break-words">{prospect.name}</h4>

                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {prospect.industry && (
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{prospect.industry}</span>
                                        )}
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(prospect.status === 'New' || !prospect.status) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); prospect.id && onUpdateStatus(prospect.id, 'Vetting'); }}
                                                className="w-full mb-2 py-1 bg-sky-600 text-white rounded text-[10px] font-bold uppercase hover:bg-sky-700 transition-all shadow-sm"
                                            >
                                                Move to Vetting
                                            </button>
                                        )}

                                        {prospect.status === 'Vetting' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); prospect.id && onUpdateStatus(prospect.id, 'Active'); }}
                                                className="w-full mb-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all shadow-sm"
                                            >
                                                Mark Won
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                                        <div className="flex gap-2 text-slate-300">
                                            {prospect.phone && <Phone size={11} />}
                                            {prospect.email && <Mail size={11} />}
                                        </div>
                                        <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                                            <Star size={10} fill="currentColor" />
                                            {prospect.rating?.toFixed(1) || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {stageProspects.length === 0 && (
                                <div className="text-center py-6 text-slate-300 text-[10px] font-bold uppercase border-2 border-dashed border-slate-200 rounded">
                                    No leads
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default memo(SalesPipelineTab);
