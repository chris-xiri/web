import React, { memo } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { usePlacesWidget } from 'react-google-autocomplete';
import type { RawLead } from '../../types';

interface RecruiterSearchTabProps {
    location: string;
    setLocation: (val: string) => void;
    radius: number;
    setRadius: (val: number) => void;
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
    location,
    setLocation,
    radius,
    setRadius,
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

    const { ref: materialRef } = usePlacesWidget({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        onPlaceSelected: (place: any) => {
            const addressComponents = place.address_components;
            const zipCode = addressComponents?.find((c: any) => c.types.includes('postal_code'))?.long_name;

            if (zipCode) {
                setLocation(zipCode);
            } else {
                // Fallback to formatted address or specific parts if zip not found
                setLocation(place.formatted_address || '');
                console.warn("No postal code found in selected place. Using formatted address.");
            }
        },
        options: {
            types: ['(regions)'],
            componentRestrictions: { country: 'us' },
        },
    });

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-indigo-100 shadow-lg"><Search size={22} /></div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">Expert AI Hunter</h2>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Search worldwide with precision targeting</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 space-y-1.5 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                        <div className="relative group">
                            <input
                                ref={materialRef as any}
                                placeholder="Address, City, State, or Zip"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
                                defaultValue={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Search size={16} className="text-slate-300 group-focus-within:text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Radius</label>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{radius} mi</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="5"
                            className="w-full h-10 accent-indigo-600 cursor-pointer"
                            value={radius}
                            onChange={e => setRadius(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise / Trade</label>
                        <input
                            placeholder="e.g. HVAC, Plumber..."
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
                            value={trade}
                            onChange={e => setTrade(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleScrape}
                        disabled={loadingSearch || !location || !trade}
                        className="w-full py-4 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {loadingSearch ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Search size={18} className="group-hover:scale-110 transition-transform" />
                                LAUNCH AI HUNTER
                            </>
                        )}
                    </button>
                </div>
            </div>

            {searchResults.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
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
                                    <th className="px-3 py-1.5 border-b border-slate-200">Contact & Location</th>
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
                                            {v.website && (
                                                <a href={v.website.startsWith('http') ? v.website : `https://${v.website}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline block mt-1 truncate max-w-[150px]">
                                                    {v.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <div className="space-y-1">
                                                {v.phone && <div className="text-[11px] font-bold text-slate-700">{v.phone}</div>}
                                                {v.address && (
                                                    <div className="text-[10px] text-slate-500 leading-tight">
                                                        {v.address}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <p className="text-[12px] text-slate-600 italic whitespace-normal leading-relaxed break-words line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                                                {v.aiSummary}
                                            </p>
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
