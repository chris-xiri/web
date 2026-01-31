import React, { memo, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Mail,
    Trash2,
    ChevronDown,
    ChevronUp,
    Filter,
    Layout,
    Save,
    Settings,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Check
} from 'lucide-react';
import type { Account } from '../../types';

interface RecruiterAccountsTabProps {
    vendors: Account[];
    onAddVendor: () => void;
    onEditVendor: (vendor: Account, e: React.MouseEvent) => void;
    onDeleteVendor: (id: string, e: React.MouseEvent) => void;
    onUpdateStatus: (id: string, status: string) => void;
    onLaunchSequence: (id: string) => void;
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

interface FilterConfig {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'isNotEmpty' | 'isEmpty';
    value: string;
}

interface SavedView {
    id: string;
    name: string;
    filters: FilterConfig[];
    sort: SortConfig;
    visibleColumns: string[];
    pageSize: number;
}

const DEFAULT_COLUMNS = ['name', 'status', 'trades', 'email', 'rating', 'createdAt'];

const ALL_AVAILABLE_COLUMNS = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Company Name' },
    { id: 'status', label: 'Status' },
    { id: 'trades', label: 'Trades' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'website', label: 'Website' },
    { id: 'rating', label: 'Rating' },
    { id: 'city', label: 'City' },
    { id: 'zipCode', label: 'Zip Code' },
    { id: 'insuranceVerified', label: 'Ins. Verified' },
    { id: 'w9Signed', label: 'W-9 Signed' },
    { id: 'outreachStatus', label: 'Outreach' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'updatedAt', label: 'Updated At' },
];

const STORAGE_KEY = 'xiri_saved_views_vendors';

const RecruiterAccountsTab = ({ vendors, onAddVendor, onEditVendor, onDeleteVendor, onUpdateStatus, onLaunchSequence }: RecruiterAccountsTabProps) => {
    const navigate = useNavigate();

    // -- GRID STATE --
    const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState<FilterConfig[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // -- UI STATE --
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isViewsOpen, setIsViewsOpen] = useState(false);
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [currentViewName, setCurrentViewName] = useState('All Vendors');

    // -- LOAD SAVED VIEWS --
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSavedViews(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved views", e);
            }
        }
    }, []);

    // -- HELPER: GET NESTED VALUE --
    const getFieldValue = (account: Account, colId: string): any => {
        switch (colId) {
            case 'city': return account.address?.city;
            case 'zipCode': return account.address?.zipCode;
            case 'insuranceVerified': return account.compliance?.insuranceVerified;
            case 'w9Signed': return account.compliance?.w9Signed;
            case 'outreachStatus': return account.outreach?.status;
            case 'trades': return account.trades?.join(', ');
            default: return (account as any)[colId];
        }
    };

    // -- DATA PROCESSING --
    const processedData = useMemo(() => {
        let result = [...vendors];

        // 1. Search (Global)
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(lowSearch) ||
                v.email?.toLowerCase().includes(lowSearch) ||
                v.trades?.some(t => t.toLowerCase().includes(lowSearch))
            );
        }

        // 2. Filters
        filters.forEach(f => {
            result = result.filter(item => {
                const val = getFieldValue(item, f.field);
                const stringVal = String(val || '').toLowerCase();
                const filterVal = f.value.toLowerCase();

                switch (f.operator) {
                    case 'equals': return stringVal === filterVal;
                    case 'contains': return stringVal.includes(filterVal);
                    case 'gt': return Number(val) > Number(f.value);
                    case 'lt': return Number(val) < Number(f.value);
                    case 'isNotEmpty': return val !== null && val !== undefined && val !== '';
                    case 'isEmpty': return val === null || val === undefined || val === '';
                    default: return true;
                }
            });
        });

        // 3. Sorting
        if (sort) {
            result.sort((a, b) => {
                const aVal = getFieldValue(a, sort.key);
                const bVal = getFieldValue(b, sort.key);

                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                const modifier = sort.direction === 'asc' ? 1 : -1;
                return aVal < bVal ? -1 * modifier : 1 * modifier;
            });
        }

        return result;
    }, [vendors, searchTerm, filters, sort]);

    // -- PAGINATION --
    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, currentPage, pageSize]);

    // -- ACTIONS --
    const handleSort = (key: string) => {
        setSort(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleColumn = (id: string) => {
        if (id === 'name') return; // Name is mandatory
        setVisibleColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const saveCurrentView = () => {
        const name = prompt("Enter view name:");
        if (!name) return;

        const newView: SavedView = {
            id: Date.now().toString(),
            name,
            filters,
            sort,
            visibleColumns,
            pageSize
        };

        const updated = [...savedViews, newView];
        setSavedViews(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setCurrentViewName(name);
    };

    const applyView = (view: SavedView | 'default') => {
        if (view === 'default') {
            setFilters([]);
            setSort({ key: 'createdAt', direction: 'desc' });
            setVisibleColumns(DEFAULT_COLUMNS);
            setPageSize(50);
            setCurrentViewName('All Vendors');
        } else {
            setFilters(view.filters);
            setSort(view.sort);
            setVisibleColumns(view.visibleColumns);
            setPageSize(view.pageSize);
            setCurrentViewName(view.name);
        }
        setIsViewsOpen(false);
    };

    const deleteView = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedViews.filter(v => v.id !== id);
        setSavedViews(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    // -- ADD FILTER UI HELPERS --
    const addFilter = () => {
        setFilters([...filters, { field: 'status', operator: 'contains', value: '' }]);
    };

    const removeFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
        setFilters(filters.map((f, i) => i === index ? { ...f, ...updates } : f));
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            {/* TOOLBAR */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-3">
                {/* View Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsViewsOpen(!isViewsOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 hover:border-indigo-300 transition-all shadow-sm"
                    >
                        <Layout size={14} className="text-indigo-600" />
                        {currentViewName}
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>
                    {isViewsOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1">
                            <button
                                onClick={() => applyView('default')}
                                className="w-full text-left px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                            >
                                All Vendors
                                {currentViewName === 'All Vendors' && <Check size={14} className="text-indigo-600" />}
                            </button>
                            {savedViews.map(view => (
                                <div key={view.id} className="group relative">
                                    <button
                                        onClick={() => applyView(view)}
                                        className="w-full text-left px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                                    >
                                        {view.name}
                                        {currentViewName === view.name && <Check size={14} className="text-indigo-600" />}
                                    </button>
                                    <button
                                        onClick={(e) => deleteView(view.id, e)}
                                        className="absolute right-2 top-1.5 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="border-t border-slate-100 my-1 pt-1">
                                <button
                                    onClick={saveCurrentView}
                                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
                                >
                                    <Save size={14} /> Save Current View
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Quick search name, email, or trade..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Columns Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <Settings size={14} />
                            Columns
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-[400px] overflow-y-auto">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Show/Hide Fields</p>
                                {ALL_AVAILABLE_COLUMNS.map(col => (
                                    <label key={col.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded text-indigo-600"
                                            checked={visibleColumns.includes(col.id)}
                                            disabled={col.id === 'name'}
                                            onChange={() => toggleColumn(col.id)}
                                        />
                                        <span className={`text-[12px] font-bold ${col.id === 'name' ? 'text-slate-400' : 'text-slate-700'}`}>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Builder */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all ${filters.length > 0 ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={14} />
                            Filters {filters.length > 0 && `(${filters.length})`}
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-1 w-[400px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Filter Builder</h4>
                                    <button onClick={() => setFilters([])} className="text-[10px] font-bold text-red-500 hover:underline">Clear All</button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {filters.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <select
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                                                value={f.field}
                                                onChange={e => updateFilter(i, { field: e.target.value })}
                                            >
                                                {ALL_AVAILABLE_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                            </select>
                                            <select
                                                className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                                                value={f.operator}
                                                onChange={e => updateFilter(i, { operator: e.target.value as any })}
                                            >
                                                <option value="contains">Contains</option>
                                                <option value="equals">Equals</option>
                                                <option value="gt">&gt;</option>
                                                <option value="lt">&lt;</option>
                                                <option value="isNotEmpty">Is Set</option>
                                                <option value="isEmpty">Not Set</option>
                                            </select>
                                            {f.operator !== 'isNotEmpty' && f.operator !== 'isEmpty' && (
                                                <input
                                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[11px]"
                                                    placeholder="Value..."
                                                    value={f.value}
                                                    onChange={e => updateFilter(i, { value: e.target.value })}
                                                />
                                            )}
                                            <button onClick={() => removeFilter(i)} className="p-1.5 text-slate-400 hover:text-red-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {filters.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-4">No active filters.</p>}
                                </div>
                                <button
                                    onClick={addFilter}
                                    className="w-full mt-4 py-2 border border-dashed border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={12} /> Add Condition
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onAddVendor}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        <Plus size={14} /> Add Vendor
                    </button>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="flex-1 overflow-auto relative bg-white">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-40 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {/* STICKY COLUMN HEADER */}
                            <th
                                className="px-4 py-3 border-b border-slate-200 sticky left-0 z-50 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Company Name
                                    {sort?.key === 'name' && (sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                </div>
                            </th>

                            {/* DYNAMIC COLUMN HEADERS */}
                            {visibleColumns.filter(c => c !== 'name').map(colId => {
                                const col = ALL_AVAILABLE_COLUMNS.find(c => c.id === colId);
                                return (
                                    <th
                                        key={colId}
                                        className="px-4 py-3 border-b border-slate-200 cursor-pointer hover:text-indigo-600 transition-colors pr-8"
                                        onClick={() => handleSort(colId)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col?.label}
                                            {sort?.key === colId && (sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                        </div>
                                    </th>
                                );
                            })}
                            <th className="px-4 py-3 border-b border-slate-200 text-right sticky right-0 bg-slate-50 z-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.map(vendor => (
                            <tr
                                key={vendor.id}
                                className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/account/${vendor.id}`)}
                            >
                                {/* STICKY NAME CELL */}
                                <td className="px-4 py-3 font-bold text-slate-900 text-[13px] sticky left-0 z-30 bg-white group-hover:bg-indigo-50/30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    {vendor.name}
                                </td>

                                {/* DYNAMIC CELLS */}
                                {visibleColumns.filter(c => c !== 'name').map(colId => {
                                    const val = getFieldValue(vendor, colId);

                                    return (
                                        <td key={colId} className="px-4 py-3 text-[12px] text-slate-600">
                                            {colId === 'status' ? (
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        vendor.status === 'Outreach' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {val || 'New'}
                                                </span>
                                            ) : colId === 'rating' ? (
                                                <div className="flex items-center gap-1 font-black text-slate-800">
                                                    {Number(val || 0).toFixed(1)}
                                                    <span className="text-amber-400">★</span>
                                                </div>
                                            ) : colId === 'insuranceVerified' || colId === 'w9Signed' ? (
                                                <span className={val ? 'text-emerald-500 font-bold' : 'text-slate-300'}>{val ? 'YES' : 'NO'}</span>
                                            ) : colId === 'createdAt' || colId === 'updatedAt' ? (
                                                <span className="text-slate-400 tabular-nums">{val ? new Date(val).toLocaleDateString() : '-'}</span>
                                            ) : (
                                                <span className="truncate max-w-[200px] block">{val || '-'}</span>
                                            )}
                                        </td>
                                    );
                                })}

                                {/* ROW ACTIONS (STICKY RIGHT) */}
                                <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-indigo-50/30 z-30">
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditVendor(vendor, e); }}
                                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); vendor.id && onDeleteVendor(vendor.id, e); }}
                                            className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedData.length === 0 && (
                    <div className="p-12 text-center">
                        <Search size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-slate-800 font-bold mb-1">No vendors found</h3>
                        <p className="text-slate-500 text-[13px]">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                    <span>Showing <b>{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, processedData.length)}</b> of <b>{processedData.length}</b> vendors</span>
                    <div className="flex items-center gap-2">
                        <span>Show:</span>
                        {[25, 50, 100].map(size => (
                            <button
                                key={size}
                                onClick={() => { setPageSize(size); setCurrentPage(1); }}
                                className={`px-2 py-0.5 rounded transition-all ${pageSize === size ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 shadow-none'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                        {/* Page Numbers could go here, but simple prev/next is often cleaner for grids */}
                        <span className="font-black text-slate-800 px-3">Page {currentPage} of {totalPages || 1}</span>
                    </div>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(RecruiterAccountsTab);
