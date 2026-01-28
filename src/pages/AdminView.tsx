import React, { useState } from 'react';
import { api } from '../services/api';

const AdminView = () => {
    const [zipCode, setZipCode] = useState('');
    const [trade, setTrade] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScrape = async () => {
        setLoading(true);
        try {
            const data = await api.scrapeVendors(zipCode, trade);
            setResults(data.vendors || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-xiri-background p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-xiri-primary">Admin Dashboard</h1>
                    <button onClick={() => window.location.reload()} className="text-sm text-xiri-secondary hover:text-xiri-primary">Refresh</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="font-semibold mb-4 text-xiri-secondary">Find New Vendors</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Zip Code"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                            <input
                                placeholder="Trade (e.g., HVAC)"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={trade}
                                onChange={(e) => setTrade(e.target.value)}
                            />
                            <button
                                onClick={handleScrape}
                                disabled={loading}
                                className="w-full bg-xiri-accent text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {loading ? 'Searching...' : 'Search G-Maps'}
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="font-semibold mb-4 text-xiri-secondary">Recent Results</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-400 uppercase">
                                    <tr>
                                        <th className="pb-3">Name</th>
                                        <th className="pb-3">Trade</th>
                                        <th className="pb-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {results.map((v, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="py-3">{v.name}</td>
                                            <td className="py-3">{v.trade}</td>
                                            <td className="py-3"><button className="text-xiri-accent">Import</button></td>
                                        </tr>
                                    ))}
                                    {results.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-slate-400">No results yet. Enter a zip code and trade to begin.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
