import { useState } from 'react';
import { api } from '../services/api';
import { Search, MapPin, RefreshCw, PlusCircle, Building2, Star } from 'lucide-react';

const AdminView = () => {
    const [zipCode, setZipCode] = useState('');
    const [trade, setTrade] = useState('');
    const [results, setResults] = useState<any[]>([]);
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

    return (
        <div className="min-h-screen bg-xiri-background p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">Admin Control</h1>
                        <p className="text-xiri-secondary font-medium mt-1">Scale your vendor network globally.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Search Panel */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Search className="text-xiri-accent" size={24} />
                                <h2 className="text-xl font-bold text-xiri-primary">Acquire Vendors</h2>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Target Zip Code</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            placeholder="e.g. 90210"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-xiri-accent/20 focus:border-xiri-accent outline-none transition-all"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Trade Category</label>
                                    <input
                                        placeholder="e.g. Electrician, Plumbing"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-xiri-accent/20 focus:border-xiri-accent outline-none transition-all"
                                        value={trade}
                                        onChange={(e) => setTrade(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleScrape}
                                    disabled={loading}
                                    className="w-full bg-xiri-primary text-white py-4 rounded-2xl font-bold hover:bg-xiri-secondary active:scale-[0.98] transition-all shadow-lg shadow-xiri-primary/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>Deploy Scraper</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-xiri-primary">Discovery Results</h2>
                                <span className="px-3 py-1 bg-xiri-accent/10 text-xiri-accent text-xs font-bold rounded-full">
                                    {results.length} Found
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor Identity</th>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">AI Summary</th>
                                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {results.map((v, i) => (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                            <Building2 size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xiri-primary">{v.companyName || v.name}</div>
                                                            <div className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{v.trades?.join(', ') || v.trade} • {zipCode}</div>
                                                            {v.website && (
                                                                <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-xiri-accent hover:underline">
                                                                    {v.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                                                </a>
                                                            )}
                                                            {v.phone && (
                                                                <div className="text-xs text-slate-500 mt-0.5">{v.phone}</div>
                                                            )}
                                                            {v.email && (
                                                                <a href={`mailto:${v.email}`} className="text-xs text-slate-500 hover:text-xiri-accent mt-0.5 block">
                                                                    {v.email}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="max-w-xs">
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                            {v.aiContextSummary || "No AI summary available yet."}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-xiri-success hover:text-white transition-all">
                                                        <PlusCircle size={20} />
                                                    </button>
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
