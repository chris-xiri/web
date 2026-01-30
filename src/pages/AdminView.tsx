import { useState } from 'react';
import { api } from '../services/api';
import { Search, MapPin, RefreshCw, PlusCircle, Building2, CheckCircle } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import LoadingBar from '../components/LoadingBar';
import type { Vendor } from '../types';

const AdminView = () => {
    const [zipCode, setZipCode] = useState('');
    const [trade, setTrade] = useState('');
    const [results, setResults] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScrape = async () => {
        if (!zipCode || !trade) return;
        setLoading(true);
        try {
            const data = await api.scrapeVendors(zipCode, trade);
            // Backend returns { message, data: Vendor[] }
            setResults(data.data || []);
        } catch (error) {
            console.error(error);
            alert('Scraper deployment failed. This usually happens if the live search takes longer than 10 seconds. Try a more specific trade.');
        }
        setLoading(false);
    };

    const handleApproveVendor = async (id: string, index: number) => {
        // Optimistic UI: Update local state immediately
        const previousResults = [...results];
        const newResults = [...results];
        newResults[index] = { ...newResults[index], status: 'Active' as const };
        setResults(newResults);

        try {
            await api.updateVendor(id, { status: 'Active' });
        } catch (error) {
            console.error("Failed to approve vendor:", error);
            // Rollback on error
            setResults(previousResults);
            alert("Failed to approve vendor. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-xiri-background p-4 font-sans">
            <LoadingBar isLoading={loading} />
            <div className="max-w-[1400px] mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-widest rounded border border-rose-200">
                                System Admin
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Operations</h1>
                    </div>
                    <LogoutButton />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Search Panel */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="text-rose-500" size={18} />
                                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Acquire Network</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Target Zip</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            placeholder="e.g. 90210"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-rose-400 transition-all font-sans"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Trade Filter</label>
                                    <input
                                        placeholder="e.g. Electrician"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-rose-400 transition-all font-sans"
                                        value={trade}
                                        onChange={(e) => setTrade(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleScrape}
                                    disabled={loading}
                                    className="w-full bg-rose-600 text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md shadow-rose-100 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <RefreshCw className="animate-spin" size={14} />
                                    ) : (
                                        <>Deploy Scraper</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Discovery Results</h2>
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded border border-rose-100 uppercase tracking-tight">
                                    {results.length} Nodes Identified
                                </span>
                            </div>

                            <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-slate-100/95 backdrop-blur-sm border-b border-slate-200">
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Analysis</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {results.map((v, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center text-slate-300 border border-slate-100">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight leading-tight">{v.companyName || v.name}</div>
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{v.trades?.join(', ') || v.trade} • {zipCode}</div>
                                                            <div className="flex gap-2 mt-1">
                                                                {v.website && (
                                                                    <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-[9px] font-sans text-rose-500 hover:underline lowercase">
                                                                        {v.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                                                    </a>
                                                                )}
                                                                {v.email && <div className="text-[9px] font-sans text-slate-400">{v.email}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="max-w-md">
                                                        <p className="text-[10px] text-slate-500 leading-snug italic line-clamp-2 hover:line-clamp-none cursor-pointer">
                                                            {v.aiContextSummary || "No AI summary available yet."}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {v.status === 'Active' ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                            <CheckCircle size={12} />
                                                            <span>Active</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApproveVendor(v.id!, i)}
                                                            className="p-1.5 bg-slate-50 text-slate-300 rounded hover:bg-emerald-500 hover:text-white transition-all border border-slate-100"
                                                            title="Approve"
                                                        >
                                                            <PlusCircle size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {results.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                            <Search size={32} />
                                                        </div>
                                                        <p className="text-slate-400 font-medium">Initialize discovery to view vendors.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
