import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, Kanban, Search, X, Building2 } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import type { Account, Activity, RawLead } from '../types';
import VendorModal from '../components/VendorModal';

// Extracted Components
import RecruiterDashboardTab from '../components/recruiter/RecruiterDashboardTab';
import RecruiterPipelineTab from '../components/recruiter/RecruiterPipelineTab';
import RecruiterAccountsTab from '../components/recruiter/RecruiterAccountsTab';
import RecruiterSearchTab from '../components/recruiter/RecruiterSearchTab';
import LoadingBar from '../components/LoadingBar';

const RecruiterView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // URL as Source of Truth
    const activeView = searchParams.get('view') || 'dashboard';
    const statusFilter = searchParams.get('status');

    const setView = (view: string, status?: string) => {
        const params: any = { view };
        if (status) params.status = status;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({ view: activeView });
    };

    // CRM Data State
    const [vendors, setVendors] = useState<Account[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Account | undefined>(undefined);

    // Search State
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState(10);
    const [trade, setTrade] = useState('');
    const [searchResults, setSearchResults] = useState<RawLead[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchVendors();
        fetchActivities();
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

    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            const res = await api.getActivities();
            if (res.data) {
                setActivities(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
        }
        setLoadingActivities(false);
    };

    const handleScrape = useCallback(async () => {
        if (!location || !trade) return;
        setLoadingSearch(true);
        setSearchResults([]);
        setSelectedIndices([]);
        try {
            const data = await api.scrapeVendors(location, trade, radius);
            setSearchResults(data.data || []);
        } catch (error) {
            console.error(error);
            alert('Search failed. Please try again.');
        }
        setLoadingSearch(false);
    }, [location, trade, radius]);

    const toggleSelection = useCallback((index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }, []);

    const processLeads = useCallback(async (indices: number[], status: 'New' | 'Rejected') => {
        if (indices.length === 0 || !user) return;
        setImporting(true);
        try {
            const leadsToProcess = indices.map(i => searchResults[i]);
            await api.importLeads(leadsToProcess, 'vendor', user.uid, status);

            const newResults = searchResults.filter((_, i) => !indices.includes(i));
            setSearchResults(newResults);
            setSelectedIndices([]);

            if (status === 'New') {
                alert(`Successfully added ${indices.length} vendors to the pipeline.`);
                fetchVendors();
                setView('pipeline');
            }
        } catch (error) {
            console.error(error);
            alert(`Failed to process vendors.`);
        }
        setImporting(false);
    }, [searchResults, user]);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: string) => {
        // Optimistic Update
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus as any } : v));
        try {
            await api.updateVendor(id, { status: newStatus });
        } catch (error) {
            console.error(error);
            fetchVendors(); // Revert
        }
    }, []);

    const handleLaunchSequence = useCallback(async (id: string) => {
        // Optimistic Update
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Outreach', outreach: { step: 1, nextEmailAt: new Date().toISOString() } } as any : v));
        try {
            await api.startOutreachSequence(id);
        } catch (error) {
            console.error(error);
            fetchVendors(); // Revert
        }
    }, []);

    const handleBulkImport = useCallback(() => processLeads(selectedIndices, 'New'), [processLeads, selectedIndices]);
    const handleSingleAdd = useCallback((index: number) => processLeads([index], 'New'), [processLeads]);

    const handleAddVendor = useCallback(() => {
        setEditingVendor(undefined);
        setIsModalOpen(true);
    }, []);

    const handleEditVendor = useCallback((vendor: Account, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingVendor(vendor);
        setIsModalOpen(true);
    }, []);

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

    const handleDrillDown = useCallback((status?: string) => {
        setView('accounts', status);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans max-w-[1600px] mx-auto">
            <LoadingBar isLoading={loadingVendors || loadingActivities || loadingSearch || importing} />
            <header className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-600 rounded text-white shadow-sm">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Recruiter Operations</h1>
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100">Ops</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Build and manage your vendor network.</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="px-3 py-1 bg-white text-slate-500 rounded text-[12px] font-semibold border border-slate-200 shadow-sm">{user?.email}</div>
                    <LogoutButton />
                </div>
            </header>

            <div className="flex gap-1 mb-3 border-b border-slate-200 overflow-x-auto select-none">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Performance' },
                    { id: 'pipeline', icon: Kanban, label: 'Outreach' },
                    { id: 'accounts', icon: List, label: 'Directory' },
                    { id: 'search', icon: Search, label: 'Hunter' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 py-1.5 rounded-t text-[11px] font-bold uppercase transition-all flex items-center gap-2 border-x border-t border-transparent ${activeView === tab.id
                            ? 'bg-white border-slate-200 text-indigo-600 shadow-[0_-2px_0_0_#4f46e5] -mb-[1px] z-10'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-[1550px] mx-auto">
                {activeView === 'dashboard' && <RecruiterDashboardTab vendors={vendors} activities={activities} loadingActivities={loadingActivities} onDrillDown={handleDrillDown} />}
                {activeView === 'pipeline' && <RecruiterPipelineTab vendors={vendors} onUpdateStatus={handleUpdateStatus} onLaunchSequence={handleLaunchSequence} />}
                {activeView === 'accounts' && (
                    <div className="space-y-3">
                        {statusFilter && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded self-start w-fit">
                                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-tight">Filtered by: {statusFilter}</span>
                                <button onClick={clearFilters} className="p-0.5 hover:bg-indigo-100 rounded text-indigo-400 hover:text-indigo-600 transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        <RecruiterAccountsTab
                            vendors={statusFilter ? vendors.filter(v => v.status === statusFilter) : vendors}
                            onAddVendor={handleAddVendor}
                            onEditVendor={handleEditVendor}
                            onUpdateStatus={handleUpdateStatus}
                            onLaunchSequence={handleLaunchSequence}
                        />
                    </div>
                )}
                {activeView === 'search' && (
                    <RecruiterSearchTab
                        location={location}
                        setLocation={setLocation}
                        radius={radius}
                        setRadius={setRadius}
                        trade={trade}
                        setTrade={setTrade}
                        handleScrape={handleScrape}
                        loadingSearch={loadingSearch}
                        searchResults={searchResults}
                        selectedIndices={selectedIndices}
                        toggleSelection={toggleSelection}
                        handleBulkImport={handleBulkImport}
                        importing={importing}
                        handleSingleAdd={handleSingleAdd}
                    />
                )}
            </div>

            <VendorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveVendor} initialData={editingVendor} />
        </div>
    );
};

export default RecruiterView;
