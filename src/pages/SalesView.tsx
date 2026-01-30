import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Building2, UserPlus, TrendingUp, Loader2, CheckCircle2, ShieldCheck, Phone, Mail, MapPin, Edit, Plus, Star, X } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import type { RawLead, Account } from '../types';
import ProspectModal from '../components/ProspectModal';
import { useNavigate } from 'react-router-dom';

const SalesView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'pipeline' | 'search'>('dashboard');

    // CRM Data State
    const [prospects, setProspects] = useState<Account[]>([]);
    const [loadingProspects, setLoadingProspects] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProspect, setEditingProspect] = useState<Account | undefined>(undefined);

    // Search State
    const [zipCode, setZipCode] = useState('');
    const [industry, setIndustry] = useState('');
    const [searchResults, setSearchResults] = useState<RawLead[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchProspects();
    }, []);

    const fetchProspects = async () => {
        setLoadingProspects(true);
        try {
            const res = await api.getVendors('prospect');
            if (res.data) {
                setProspects(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch prospects", error);
        }
        setLoadingProspects(false);
    };

    const handleScrape = async () => {
        if (!zipCode || !industry) return;
        setLoadingSearch(true);
        setSearchResults([]);
        setSelectedIndices([]);
        try {
            const data = await api.scrapeProspects(zipCode, industry);
            setSearchResults(data.data || []);
        } catch (error) {
            console.error(error);
            alert('Search failed. Please try again.');
        }
        setLoadingSearch(false);
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
            await api.importLeads(leadsToImport, 'prospect', user.uid, 'New');

            alert(`Successfully imported ${leadsToImport.length} prospects!`);
            setSearchResults([]);
            setSelectedIndices([]);
            fetchProspects();
            setActiveTab('pipeline');
        } catch (error) {
            console.error(error);
            alert('Import failed.');
        }
        setImporting(false);
    };

    // --- Modal Handlers ---
    const handleAddProspect = () => {
        setEditingProspect(undefined);
        setIsModalOpen(true);
    };

    const handleEditProspect = (prospect: Account, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProspect(prospect);
        setIsModalOpen(true);
    };

    const handleSaveProspect = async (data: Partial<Account>) => {
        try {
            if (editingProspect && editingProspect.id) {
                await api.updateVendor(editingProspect.id, data);
            } else {
                await api.createVendor({ ...data, type: 'prospect' }); // Re-use createVendor for simplicity as it just posts to accounts
            }
            fetchProspects();
        } catch (error) {
            console.error("Failed to save prospect", error);
            alert("Failed to save prospect");
        }
    };

    // --- DnD Logic ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('currId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        const id = e.dataTransfer.getData('currId');
        if (!id) return;

        // Optimistic UI update
        const updatedProspects = prospects.map(p =>
            p.id === id ? { ...p, status: newStatus as any } : p
        );
        setProspects(updatedProspects);

        try {
            await api.updateVendor(id, { status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            fetchProspects(); // Revert on error
        }
    };


    // --- Sub-Components ---

    const DashboardTab = () => {
        const stats = [
            { label: 'Total Prospects', value: prospects.length, icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'New Targets', value: prospects.filter(v => v.status === 'New').length, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Won Deals', value: prospects.filter(v => v.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'In Negotiation', value: prospects.filter(v => v.status === 'Vetting').length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const PipelineTab = () => {
        const stages = ['New', 'Contacted', 'Vetting', 'Active', 'Rejected'];

        return (
            <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-250px)]">
                {stages.map(stage => {
                    const stageProspects = prospects.filter(p => (p.status || 'New') === stage);
                    return (
                        <div
                            key={stage}
                            className="min-w-[320px] flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-full"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-slate-700">{stage}</h3>
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-500 shadow-sm border border-slate-100">{stageProspects.length}</span>
                            </div>
                            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                                {stageProspects.map(prospect => (
                                    <div
                                        key={prospect.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, prospect.id!)}
                                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative"
                                        onClick={() => navigate(`/account/${prospect.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 line-clamp-1">{prospect.name}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {prospect.industry && (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{prospect.industry}</span>
                                            )}
                                            {prospect.status && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                                                    ${prospect.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                                        prospect.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {prospect.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                            <div className="flex gap-2">
                                                {prospect.phone && <Phone size={14} className="text-slate-400" />}
                                                {prospect.email && <Mail size={14} className="text-slate-400" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stageProspects.length === 0 && (
                                    <div className="text-center py-12 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                        No prospects
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const AccountsTab = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-bold text-slate-800 text-lg">All Prospects</h3>
                    <button
                        onClick={handleAddProspect}
                        className="flex items-center gap-2 px-4 py-2 bg-xiri-accent text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-200"
                    >
                        <Plus size={18} /> Add Prospect
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-center">Size</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {prospects.filter(p => p.status !== 'Rejected').map((prospect) => (
                            <tr key={prospect.id} onClick={() => navigate(`/account/${prospect.id}`)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{prospect.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        {prospect.industry || 'Unknown Industry'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold 
                                        ${prospect.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                            prospect.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                                prospect.status === 'Vetting' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'}`}>
                                        {prospect.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-300" />
                                        {prospect.address?.city ? `${prospect.address.city}, ${prospect.address.state}` : prospect.address?.zipCode || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 space-y-1">
                                        {prospect.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {prospect.email}</div>}
                                        {prospect.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {prospect.phone}</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
                                    {prospect.sqFt ? `${prospect.sqFt.toLocaleString()} sqft` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => handleEditProspect(prospect, e)}
                                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-xiri-background p-6 font-sans">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-sky-100 text-xiri-accent text-[10px] font-bold uppercase tracking-wider rounded-md border border-sky-200">
                            Sales
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">Growth Workspace</h1>
                    <p className="text-slate-500">Hunt for new business and manage pipeline.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="px-4 py-2 bg-white text-slate-600 rounded-xl text-sm font-bold border border-slate-100 shadow-sm">
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
                            ? 'bg-white text-xiri-accent shadow-sm border border-b-0 border-slate-100 translate-y-px'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'search' && 'AI'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'pipeline' && <PipelineTab />}
                {activeTab === 'accounts' && <AccountsTab />}

                {/* AI Search Content (existing logic preserved) */}
                {activeTab === 'search' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-sky-50 text-xiri-accent rounded-2xl">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Prospect Intelligence</h2>
                                    <p className="text-slate-500 text-sm">Identify high-value targets by industry and location.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Zip Code (e.g. 90210)"
                                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-xiri-accent transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Target Industry (e.g. Property Management)"
                                    className="flex-[2] px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-xiri-accent transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                                <button
                                    onClick={handleScrape}
                                    disabled={loading || !zipCode || !industry}
                                    className="px-8 py-4 bg-xiri-primary text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Hunt Prospects'}
                                </button>
                            </div>
                        </div>

                        {/* Results Table */}
                        {searchResults.length > 0 && (
                            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-700">Identified {searchResults.length} Targets</h3>
                                    {selectedIndices.length > 0 && (
                                        <button
                                            onClick={handleImport}
                                            disabled={importing}
                                            className="flex items-center gap-2 px-6 py-2 bg-xiri-success text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-200 text-sm"
                                        >
                                            {importing ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={18} />}
                                            Add {selectedIndices.length} to Pipeline
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                                                <th className="px-8 py-4 w-16 text-center">Select</th>
                                                <th className="px-8 py-4">Company</th>
                                                <th className="px-8 py-4 w-1/3">Intel Summary</th>
                                                <th className="px-8 py-4 text-right">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {searchResults.map((v, i) => (
                                                <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${selectedIndices.includes(i) ? 'bg-sky-50/30' : ''}`}>
                                                    <td className="px-8 py-5 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIndices.includes(i)}
                                                            onChange={() => toggleSelection(i)}
                                                            className="w-5 h-5 rounded border-slate-300 text-xiri-accent focus:ring-sky-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-700">{v.companyName}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{v.address}</div>
                                                        {v.website && (
                                                            <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-xiri-accent hover:underline mt-1 block truncate max-w-[200px]">
                                                                {v.website}
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer">
                                                            {v.aiSummary || "Analysing business profile..."}
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
            </div>

            <ProspectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProspect}
                initialData={editingProspect}
            />
        </div>
    );
};

export default SalesView;
