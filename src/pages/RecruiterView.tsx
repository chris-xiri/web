import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Building2, UserPlus, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import type { Vendor } from '../types';

const RecruiterView = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'pipeline' | 'search'>('search');

    // Search State
    const [zipCode, setZipCode] = useState('');
    const [trade, setTrade] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]); // Raw leads
    const [loading, setLoading] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [importing, setImporting] = useState(false);

    const handleScrape = async () => {
        if (!zipCode || !trade) return;
        setLoading(true);
        setSearchResults([]);
        setSelectedIndices([]);
        try {
            const data = await api.scrapeVendors(zipCode, trade);
            // Expecting RawLead[] directly from new backend logic
            // Backend returns { message, data: RawLead[] }
            setSearchResults(data.data || []);
        } catch (error) {
            console.error(error);
            alert('Search failed. Please try again.');
        }
        setLoading(false);
    };

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleImport = async () => {
        if (selectedIndices.length === 0 || !user) return;
        setImporting(true);
        try {
            const leadsToImport = selectedIndices.map(i => searchResults[i]);
            await api.importLeads(leadsToImport, 'vendor', user.uid);

            alert(`Successfully imported ${leadsToImport.length} vendors!`);
            setSearchResults([]);
            setSelectedIndices([]);
            setActiveTab('accounts'); // Switch to accounts view to see them (not implemented yet, but logical flow)
        } catch (error) {
            console.error(error);
            alert('Import failed.');
        }
        setImporting(false);
    };

    return (
        <div className="min-h-screen bg-xiri-background p-6 font-sans">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">Recruiter Workspace</h1>
                    <p className="text-slate-500">Manage vendor relationships and sourcing.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100">
                        {user?.email}
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-8 border-b border-slate-100 pb-1 overflow-x-auto">
                {['dashboard', 'accounts', 'pipeline', 'search'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2.5 rounded-t-xl text-sm font-bold transition-all ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm border border-b-0 border-slate-100 translate-y-px'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'search' && 'AI'}
                    </button>
                ))}
            </div>

            {/* AI Search Content */}
            {activeTab === 'search' && (
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                <Search size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">AI Vendor Sourcing</h2>
                                <p className="text-slate-500 text-sm">Find and vet local professionals using Google Maps & Gemini.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Zip Code (e.g. 10001)"
                                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Trade (e.g. Commercial HVAC)"
                                className="flex-[2] px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                value={trade}
                                onChange={(e) => setTrade(e.target.value)}
                            />
                            <button
                                onClick={handleScrape}
                                disabled={loading || !zipCode || !trade}
                                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Run AI Search'}
                            </button>
                        </div>
                    </div>

                    {/* Results Table */}
                    {searchResults.length > 0 && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-700">Found {searchResults.length} Potential Vendors</h3>
                                {selectedIndices.length > 0 && (
                                    <button
                                        onClick={handleImport}
                                        disabled={importing}
                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 text-sm"
                                    >
                                        {importing ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={18} />}
                                        Import {selectedIndices.length} Selected
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                                            <th className="px-8 py-4 w-16 text-center">Select</th>
                                            <th className="px-8 py-4">Company</th>
                                            <th className="px-8 py-4">Contact</th>
                                            <th className="px-8 py-4 w-1/3">AI Analysis</th>
                                            <th className="px-8 py-4 text-right">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {searchResults.map((v, i) => (
                                            <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${selectedIndices.includes(i) ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-8 py-5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIndices.includes(i)}
                                                        onChange={() => toggleSelection(i)}
                                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-slate-700">{v.companyName}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{v.address}</div>
                                                    {v.website && (
                                                        <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-1 block truncate max-w-[200px]">
                                                            {v.website}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5">
                                                    {v.phone && <div className="text-slate-600">{v.phone}</div>}
                                                    {v.email && <div className="text-slate-400 text-xs mt-1">{v.email}</div>}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer">
                                                        {v.aiSummary || "Processing content..."}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5 text-right font-bold text-slate-700">
                                                    {v.rating ? v.rating.toFixed(1) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'search' && (
                <div className="text-center py-20 text-slate-400">
                    <div className="mb-4 bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Building2 size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-600">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    <p>This module is under construction.</p>
                </div>
            )}
        </div>
    );
};

export default RecruiterView;
