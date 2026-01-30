import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, Kanban, Search, X, Building2 } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import type { RawLead, Account } from '../types';
import ProspectModal from '../components/ProspectModal';

// Extracted Components
import SalesDashboardTab from '../components/sales/SalesDashboardTab';
import SalesPipelineTab from '../components/sales/SalesPipelineTab';
import SalesAccountsTab from '../components/sales/SalesAccountsTab';
import SalesSearchTab from '../components/sales/SalesSearchTab';
import LoadingBar from '../components/LoadingBar';

const SalesView = () => {
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

    const handleScrape = useCallback(async () => {
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
    }, [zipCode, industry]);

    const toggleSelection = useCallback((index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }, []);

    const handleImport = useCallback(async () => {
        if (selectedIndices.length === 0 || !user) return;
        setImporting(true);
        try {
            const leadsToImport = selectedIndices.map(i => searchResults[i]);
            await api.importLeads(leadsToImport, 'prospect', user.uid, 'New');

            alert(`Successfully imported ${leadsToImport.length} prospects!`);
            setSearchResults([]);
            setSelectedIndices([]);
            fetchProspects();
            setView('pipeline');
        } catch (error) {
            console.error(error);
            alert('Import failed.');
        }
        setImporting(false);
    }, [selectedIndices, searchResults, user]);

    // --- Modal Handlers ---
    const handleAddProspect = useCallback(() => {
        setEditingProspect(undefined);
        setIsModalOpen(true);
    }, []);

    const handleEditProspect = useCallback((prospect: Account, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProspect(prospect);
        setIsModalOpen(true);
    }, []);

    const handleSaveProspect = async (data: Partial<Account>) => {
        try {
            if (editingProspect && editingProspect.id) {
                await api.updateVendor(editingProspect.id, data);
            } else {
                await api.createVendor({ ...data, type: 'prospect' });
            }
            fetchProspects();
        } catch (error) {
            console.error("Failed to save prospect", error);
            alert("Failed to save prospect");
        }
    };

    // --- DnD Logic ---
    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('currId', id);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, newStatus: string) => {
        const id = e.dataTransfer.getData('currId');
        if (!id) return;

        // Optimistic UI update
        setProspects(prev => prev.map(p =>
            p.id === id ? { ...p, status: newStatus as any } : p
        ));

        try {
            await api.updateVendor(id, { status: newStatus });
        } catch (err) {
            console.error("Failed to update status", err);
            fetchProspects(); // Revert on error
        }
    }, []);

    const handleUpdateStatus = useCallback(async (id: string, newStatus: string) => {
        // Optimistic Update
        setProspects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
        try {
            await api.updateVendor(id, { status: newStatus });
        } catch (error) {
            console.error(error);
            fetchProspects(); // Revert
        }
    }, []);

    const handleDrillDown = useCallback((status?: string) => {
        setView('accounts', status);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans max-w-[1600px] mx-auto">
            <LoadingBar isLoading={loadingProspects || loadingSearch || importing} />
            <header className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-sky-600 rounded text-white shadow-sm">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Growth Command</h1>
                            <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider rounded border border-sky-100">Sales</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Accelerate revenue and prospect acquisition.</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="px-3 py-1 bg-white text-slate-500 rounded text-[12px] font-semibold border border-slate-200 shadow-sm">{user?.email}</div>
                    <LogoutButton />
                </div>
            </header>

            <div className="flex gap-1 mb-3 border-b border-slate-200 overflow-x-auto select-none">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' },
                    { id: 'pipeline', icon: Kanban, label: 'Deal Board' },
                    { id: 'accounts', icon: List, label: 'Prospects' },
                    { id: 'search', icon: Search, label: 'Intelligence' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 py-1.5 rounded-t text-[11px] font-bold uppercase transition-all flex items-center gap-2 border-x border-t border-transparent ${activeView === tab.id
                            ? 'bg-white border-slate-200 text-sky-600 shadow-[0_-2px_0_0_#0284c7] -mb-[1px] z-10'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-[1550px] mx-auto">
                {activeView === 'dashboard' && <SalesDashboardTab prospects={prospects} onDrillDown={handleDrillDown} />}
                {activeView === 'pipeline' && (
                    <SalesPipelineTab
                        prospects={prospects}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDrop={handleDrop}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
                {activeView === 'accounts' && (
                    <div className="space-y-3">
                        {statusFilter && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded self-start w-fit">
                                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-tight">Filtered by: {statusFilter}</span>
                                <button onClick={clearFilters} className="p-0.5 hover:bg-sky-100 rounded text-sky-400 hover:text-sky-600 transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        <SalesAccountsTab
                            prospects={statusFilter ? prospects.filter(p => p.status === statusFilter) : prospects}
                            onAddProspect={handleAddProspect}
                            onEditProspect={handleEditProspect}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </div>
                )}
                {activeView === 'search' && (
                    <SalesSearchTab
                        zipCode={zipCode}
                        setZipCode={setZipCode}
                        industry={industry}
                        setIndustry={setIndustry}
                        handleScrape={handleScrape}
                        loadingSearch={loadingSearch}
                        searchResults={searchResults}
                        selectedIndices={selectedIndices}
                        toggleSelection={toggleSelection}
                        handleImport={handleImport}
                        importing={importing}
                    />
                )}
            </div>

            <ProspectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProspect} initialData={editingProspect} />
        </div>
    );
};

export default SalesView;
