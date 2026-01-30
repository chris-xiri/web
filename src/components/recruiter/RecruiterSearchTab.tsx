import React, { memo } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';
import type { RawLead } from '../../types';

interface RecruiterSearchTabProps {
    zipCode: string;
    setZipCode: (val: string) => void;
    trade: string;
    setTrade: (val: string) => void;
    handleScrape: () => void;
    loadingSearch: boolean;
    searchResults: RawLead[];
    selectedIndices: number[];
    toggleSelection: (index: number) => void;
    handleBulkImport: () => void;
    importing: boolean;
    handleSingleAdd: (index: number) => void;
}

const RecruiterSearchTab = ({
    zipCode,
    setZipCode,
    trade,
    setTrade,
    handleScrape,
    loadingSearch,
    searchResults,
    selectedIndices,
    toggleSelection,
    handleBulkImport,
    importing,
    handleSingleAdd
}: RecruiterSearchTabProps) => {
    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Search size={18} /></div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identify Experts</h2>
                </div>
                <div className="flex gap-3">
                    <input
                        placeholder="Zip"
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                    />
                    <input
                        placeholder="Trade..."
                        className="flex-[2] px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        value={trade}
                        onChange={e => setTrade(e.target.value)}
                    />
                    <button
                        onClick={handleScrape}
                        disabled={loadingSearch || !zipCode || !trade}
                        className="px-6 py-2 bg-purple-600 text-white text-xs font-black rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                        {loadingSearch ? <Loader2 size={14} className="animate-spin" /> : 'HUNT'}
                    </button>
                </div>
            </div>
            {searchResults.length > 0 && (
                <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-[14px] font-bold text-slate-800">Review Found Experts</h3>
                        {selectedIndices.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkImport}
                                    disabled={importing}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded text-[12px] font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    {importing ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={14} />}
                                    IMPORT ({selectedIndices.length})
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                <tr className="text-[12px] font-semibold text-slate-500 uppercase tracking-tight">
                                    <th className="px-3 py-1.5 border-b border-slate-200 w-10 text-center">Sel</th>
                                    <th className="px-3 py-1.5 border-b border-slate-200">Company</th>
                                    <th className="px-3 py-1.5 border-b border-slate-200">AI Analysis & Insights</th>
                                    <th className="px-3 py-1.5 border-b border-slate-200 text-right pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {searchResults.map((v, i) => (
                                    <tr key={i} className={`hover:bg-slate-50 transition-colors ${selectedIndices.includes(i) ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-3 py-2 align-top text-center">
                                            <input type="checkbox" checked={selectedIndices.includes(i)} onChange={() => toggleSelection(i)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <div className="font-bold text-slate-900 text-[13px] leading-tight break-words">{v.companyName}</div>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <p className="text-[12px] text-slate-600 italic whitespace-normal leading-relaxed break-words">{v.aiSummary}</p>
                                        </td>
                                        <td className="px-3 py-2 align-top text-right pr-4">
                                            <button
                                                onClick={() => handleSingleAdd(i)}
                                                className="p-1 px-2 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-100 transition-all font-bold text-[11px] uppercase flex items-center gap-1 mx-auto"
                                            >
                                                <UserPlus size={13} /> Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(RecruiterSearchTab);
