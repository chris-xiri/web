import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Building2, UserPlus, CheckCircle2, X, Loader2, LayoutDashboard, List, Kanban, Phone, FileCheck, ShieldCheck, Mail, MapPin, Star, MoreVertical, Plus, Edit } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import type { Account, Vendor } from '../types';
import VendorModal from '../components/VendorModal';


const RecruiterView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'pipeline' | 'search'>('dashboard');

    // CRM Data State
    const [vendors, setVendors] = useState<Account[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Account | undefined>(undefined);

    // Search State
    const [zipCode, setZipCode] = useState('');
    const [trade, setTrade] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]); // Raw leads
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoadingVendors(true);
        try {
            const res = await api.getVendors('vendor');
            if (res.data) {
                setVendors(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        }
        setLoadingVendors(false);
    };

    const handleScrape = async () => {
        if (!zipCode || !trade) return;
        setLoadingSearch(true);
        setSearchResults([]);
        setSelectedIndices([]);
        try {
            const data = await api.scrapeVendors(zipCode, trade);
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

    const processLeads = async (indices: number[], status: 'New' | 'Rejected') => {
        if (indices.length === 0 || !user) return;
        setImporting(true);
        try {
            const leadsToProcess = indices.map(i => searchResults[i]);
            await api.importLeads(leadsToProcess, 'vendor', user.uid, status);

            // Remove processed items from search results
            const newResults = searchResults.filter((_, i) => !indices.includes(i));
            setSearchResults(newResults);
            setSelectedIndices([]); // Clear selection

            if (status === 'New') {
                fetchVendors(); // Refresh list only if added
                // Optional: Switch tab if bulk import
                // setActiveTab('pipeline');
            }
        } catch (error) {
            console.error(error);
            alert(`Failed to process vendors.`);
        }
        setImporting(false);
    };

    const handleBulkImport = () => processLeads(selectedIndices, 'New');
    const handleBulkReject = () => processLeads(selectedIndices, 'Rejected');

    // Single row actions
    const handleSingleAdd = (index: number) => processLeads([index], 'New');
    const handleSingleReject = (index: number) => processLeads([index], 'Rejected');

    // Modal Handlers
    const handleAddVendor = () => {
        setEditingVendor(undefined);
        setIsModalOpen(true);
    };

    const handleEditVendor = (vendor: Account, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent row click navigation
        setEditingVendor(vendor);
        setIsModalOpen(true);
    };

    const handleSaveVendor = async (data: Partial<Account>) => {
        try {
            if (editingVendor && editingVendor.id) {
                await api.updateVendor(editingVendor.id, data);
            } else {
                await api.createVendor(data);
            }
            fetchVendors();
        } catch (error) {
            console.error("Failed to save vendor", error);
            alert("Failed to save vendor");
        }
    };


    // --- Sub-Components ---

    const DashboardTab = () => {
        const stats = [
            { label: 'Total Vendors', value: vendors.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'New Leads', value: vendors.filter(v => v.status === 'New').length, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active', value: vendors.filter(v => v.status === 'Active').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Vetting', value: vendors.filter(v => v.status === 'Vetting').length, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
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

                {/* Recent Activity or Placeholder */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <p className="text-slate-400">Activity feed coming soon...</p>
                </div>
            </div>
        );
    };

    const PipelineTab = () => {
        const stages = ['New', 'Contacted', 'Vetting', 'Active', 'Rejected'];

        return (
            <div className="flex gap-6 overflow-x-auto pb-6">
                {stages.map(stage => {
                    const stageVendors = vendors.filter(v => (v.status || 'New') === stage);
                    return (
                        <div key={stage} className="min-w-[300px] flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-slate-700">{stage}</h3>
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-500 shadow-sm">{stageVendors.length}</span>
                            </div>
                            <div className="space-y-3">
                                {stageVendors.map(vendor => (
                                    <div key={vendor.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800 line-clamp-1">{vendor.name}</h4>
                                            {/* <MoreVertical size={16} className="text-slate-300" /> */}
                                        </div>
                                        {vendor.trades && vendor.trades.length > 0 && (
                                            <div className="text-xs text-slate-500 mb-2">{vendor.trades[0]}</div>
                                        )}
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                            <div className="flex gap-2">
                                                {vendor.phone && <Phone size={14} className="text-slate-400" />}
                                                {vendor.email && <Mail size={14} className="text-slate-400" />}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                                <Star size={12} fill="currentColor" />
                                                {vendor.rating?.toFixed(1) || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stageVendors.length === 0 && (
                                    <div className="text-center py-8 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                        No vendors
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
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">All Vendors</h3>
                    <button
                        onClick={handleAddVendor}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus size={18} /> Add Vendor
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Compliance & Contract</th>
                            <th className="px-6 py-4 text-center">Rating</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vendors.filter(v => v.status !== 'Rejected').map((vendor) => (
                            <tr key={vendor.id} onClick={() => navigate(`/account/${vendor.id}`)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{vendor.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin size={12} />
                                        {vendor.address?.fullNumber || vendor.address?.zipCode || 'No Address'}
                                    </div>
                                    {vendor.trades && vendor.trades.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{vendor.trades[0]}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold 
                                        ${vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                            vendor.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                                vendor.status === 'Vetting' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'}`}>
                                        {vendor.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 space-y-1">
                                        {vendor.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {vendor.email}</div>}
                                        {vendor.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {vendor.phone}</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {/* Insurance */}
                                        <div className={`p-1.5 rounded-lg border ${vendor.compliance?.insuranceVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`} title="Insurance Verified">
                                            <ShieldCheck size={16} />
                                        </div>
                                        {/* LLC */}
                                        <div className={`p-1.5 rounded-lg border ${vendor.compliance?.isLLC ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`} title="LLC Registered">
                                            <Building2 size={16} />
                                        </div>
                                        {/* Contract */}
                                        <div className={`p-1.5 rounded-lg border ${vendor.status === 'Active' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`} title="Contract Active">
                                            <FileCheck size={16} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-700">
                                    {vendor.rating?.toFixed(1) || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => handleEditVendor(vendor, e)}
                                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
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
                    <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">Recruiter Workspace</h1>
                    <p className="text-slate-500">Find, vet, and onboard service partners.</p>
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
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all ${activeTab === 'dashboard'
                        ? 'bg-white text-indigo-600 shadow-sm border border-b-0 border-slate-100 translate-y-px'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all ${activeTab === 'pipeline'
                        ? 'bg-white text-indigo-600 shadow-sm border border-b-0 border-slate-100 translate-y-px'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Kanban size={18} /> Pipeline
                </button>
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all ${activeTab === 'accounts'
                        ? 'bg-white text-indigo-600 shadow-sm border border-b-0 border-slate-100 translate-y-px'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <List size={18} /> All Vendors
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all ${activeTab === 'search'
                        ? 'bg-purple-50 text-purple-600 shadow-sm border border-b-0 border-purple-100 translate-y-px'
                        : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                >
                    <Search size={18} /> AI Search
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'pipeline' && <PipelineTab />}
                {activeTab === 'accounts' && <AccountsTab />}

                {activeTab === 'search' && (
                    <>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">AI Vendor Sourcing</h2>
                                    <p className="text-slate-500 text-sm">Find and vet local professionals.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Zip Code (e.g. 10001)"
                                    className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Trade (e.g. Commercial HVAC)"
                                    className="flex-[2] px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={trade}
                                    onChange={(e) => setTrade(e.target.value)}
                                />
                                <button
                                    onClick={handleScrape}
                                    disabled={loadingSearch || !zipCode || !trade}
                                    className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                                >
                                    {loadingSearch ? <Loader2 className="animate-spin" /> : 'Run AI Search'}
                                </button>
                            </div>
                        </div>

                        {/* Results Table */}
                        {searchResults.length > 0 && (
                            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-700">Found {searchResults.length} Potential Vendors</h3>
                                    {selectedIndices.length > 0 && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleBulkReject}
                                                disabled={importing}
                                                className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                                            >
                                                <X size={18} />
                                                Reject ({selectedIndices.length})
                                            </button>
                                            <button
                                                onClick={handleBulkImport}
                                                disabled={importing}
                                                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 text-sm"
                                            >
                                                {importing ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={18} />}
                                                Add Selected ({selectedIndices.length})
                                            </button>
                                        </div>
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
                                                <th className="px-8 py-4 text-center">Rating</th>
                                                <th className="px-8 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {searchResults.map((v, i) => (
                                                <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${selectedIndices.includes(i) ? 'bg-purple-50/30' : ''}`}>
                                                    <td className="px-8 py-5 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIndices.includes(i)}
                                                            onChange={() => toggleSelection(i)}
                                                            className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-slate-700">{v.companyName}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{v.address}</div>
                                                        {v.website && (
                                                            <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline mt-1 block truncate max-w-[200px]">
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
                                                    <td className="px-8 py-5 text-center font-bold text-slate-700">
                                                        {v.rating ? v.rating.toFixed(1) : '-'}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleSingleReject(i)}
                                                                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSingleAdd(i)}
                                                                className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                                                                title="Add"
                                                            >
                                                                <UserPlus size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab !== 'search' && activeTab !== 'dashboard' && activeTab !== 'pipeline' && activeTab !== 'accounts' && (
                    <div className="text-center py-20 text-slate-400">
                        <p>Module not found.</p>
                    </div>
                )}
            </div>

            <VendorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVendor}
                initialData={editingVendor}
            />
        </div>
    );
};

export default RecruiterView;
