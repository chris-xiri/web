import React, { memo, useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
    Plus,
    Edit,
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
    Check,
    User,
    Building
} from 'lucide-react';
import type { Contact, Account } from '../../types';

interface RecruiterContactsTabProps {
    contacts: Contact[];
    accounts: Account[];
    onAddContact: () => void;
    onDeleteContact: (id: string, e: React.MouseEvent) => void;
    onUpdateContact: (id: string, updates: Partial<Contact>) => void;
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

const DEFAULT_COLUMNS = ['firstName', 'lastName', 'title', 'accountName', 'email', 'phone', 'isPrimary'];

const ALL_AVAILABLE_COLUMNS = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'title', label: 'Title/Position' },
    { id: 'accountName', label: 'Company' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'isPrimary', label: 'Primary Contact' },
    { id: 'createdAt', label: 'Created At' },
];

const STORAGE_KEY = 'xiri_saved_views_contacts';
const COLUMNS_STORAGE_KEY = 'xiri_contact_table_columns';

const RecruiterContactsTab = ({ contacts, accounts, onAddContact, onDeleteContact, onUpdateContact }: RecruiterContactsTabProps) => {
    // -- GRID STATE --
    const [sort, setSort] = useState<SortConfig>({ key: 'lastName', direction: 'asc' });
    const [filters, setFilters] = useState<FilterConfig[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const stored = localStorage.getItem(COLUMNS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_COLUMNS;
    });
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // -- INLINE EDITING STATE --
    const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
    const [tempValue, setTempValue] = useState('');

    // -- UI STATE --
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isViewsOpen, setIsViewsOpen] = useState(false);
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [currentViewName, setCurrentViewName] = useState('All Contacts');

    // -- REFS FOR CLICK OUTSIDE --
    const filterRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const viewsRef = useRef<HTMLDivElement>(null);

    // -- PERSIST COLUMNS --
    useEffect(() => {
        localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    // -- CLICK OUTSIDE HANDLER --
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
            if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) setIsColumnsOpen(false);
            if (viewsRef.current && !viewsRef.current.contains(event.target as Node)) setIsViewsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // -- HELPER: GET VALUE --
    const getFieldValue = (contact: Contact, colId: string): any => {
        if (colId === 'accountName') {
            const acc = accounts.find(a => a.id === contact.accountId);
            return acc ? acc.name : 'Unknown';
        }
        return (contact as any)[colId];
    };

    // -- DATA PROCESSING --
    const processedData = useMemo(() => {
        let result = [...contacts];

        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.firstName.toLowerCase().includes(lowSearch) ||
                c.lastName.toLowerCase().includes(lowSearch) ||
                c.email?.toLowerCase().includes(lowSearch) ||
                c.title?.toLowerCase().includes(lowSearch)
            );
        }

        filters.forEach(f => {
            result = result.filter(item => {
                const val = getFieldValue(item, f.field);
                const stringVal = String(val || '').toLowerCase();
                const filterVal = f.value.toLowerCase();
                switch (f.operator) {
                    case 'equals': return stringVal === filterVal;
                    case 'contains': return stringVal.includes(filterVal);
                    case 'isNotEmpty': return !!val;
                    case 'isEmpty': return !val;
                    default: return true;
                }
            });
        });

        if (sort) {
            result.sort((a, b) => {
                const aVal = getFieldValue(a, sort.key);
                const bVal = getFieldValue(b, sort.key);
                if (aVal === bVal) return 0;
                const modifier = sort.direction === 'asc' ? 1 : -1;
                return aVal < bVal ? -1 * modifier : 1 * modifier;
            });
        }
        return result;
    }, [contacts, searchTerm, filters, sort, accounts]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, currentPage, pageSize]);

    const totalPages = Math.ceil(processedData.length / pageSize);

    // -- ACTIONS --
    const toggleColumn = (id: string) => {
        if (id === 'firstName') return;
        setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const handleInlineSave = async (id: string, field: string, value: any) => {
        setEditingCell(null);
        let actualValue = value;
        if (field === 'isPrimary') actualValue = value === 'yes';

        onUpdateContact(id, { [field]: actualValue });
        try {
            await api.updateContact(id, { [field]: actualValue });
        } catch (error) {
            console.error("Save failed", error);
            alert("Save failed");
        }
    };

    const EditableCell = ({ value, rowId, field, children, className = '' }: any) => {
        const isEditing = editingCell?.id === rowId && editingCell?.field === field;
        const startEditing = (e: React.MouseEvent) => {
            e.stopPropagation();
            setEditingCell({ id: rowId, field });
            setTempValue(String(value || ''));
        };

        if (isEditing) {
            return (
                <td className="px-4 py-3">
                    {field === 'accountId' ? (
                        <select
                            autoFocus
                            className="w-full bg-white border border-indigo-400 rounded px-1 py-0.5 text-[11px] font-bold outline-none"
                            value={tempValue}
                            onChange={e => setTempValue(e.target.value)}
                            onBlur={() => handleInlineSave(rowId, field, tempValue)}
                        >
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    ) : field === 'isPrimary' ? (
                        <select
                            autoFocus
                            className="w-full bg-white border border-indigo-400 rounded px-1 py-0.5 text-[11px] font-bold outline-none"
                            value={tempValue}
                            onChange={e => setTempValue(e.target.value)}
                            onBlur={() => handleInlineSave(rowId, field, tempValue)}
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    ) : (
                        <input
                            autoFocus
                            className="w-full bg-white border border-indigo-400 rounded px-2 py-0.5 text-[11px] outline-none"
                            value={tempValue}
                            onChange={e => setTempValue(e.target.value)}
                            onBlur={() => handleInlineSave(rowId, field, tempValue)}
                            onKeyDown={e => e.key === 'Enter' && handleInlineSave(rowId, field, tempValue)}
                        />
                    )}
                </td>
            );
        }

        return (
            <td className={`group/cell px-4 py-3 cursor-text hover:bg-slate-50/50 transition-colors ${className}`} onDoubleClick={startEditing}>
                <div className="flex items-center justify-between gap-2">
                    {children || <span className="truncate">{value || '-'}</span>}
                    <div className="opacity-0 group-hover/cell:opacity-40 transition-opacity">
                        <Edit size={10} className="text-slate-400" />
                    </div>
                </div>
            </td>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            {/* TOOLBAR */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search name, company, or title..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-indigo-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative" ref={columnsRef}>
                        <button onClick={() => setIsColumnsOpen(!isColumnsOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600">
                            <Settings size={14} /> Columns
                        </button>
                        {isColumnsOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2">
                                {ALL_AVAILABLE_COLUMNS.map(col => (
                                    <label key={col.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <input type="checkbox" checked={visibleColumns.includes(col.id)} disabled={col.id === 'firstName'} onChange={() => toggleColumn(col.id)} />
                                        <span className="text-[11px] font-bold">{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={onAddContact} className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 shadow-md">
                        <Plus size={14} /> Add Contact
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-auto relative">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-40 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                        <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                            {visibleColumns.map(colId => (
                                <th key={colId} className="px-4 py-3 border-b border-slate-200 cursor-pointer hover:text-indigo-600" onClick={() => setSort({ key: colId, direction: sort?.key === colId && sort.direction === 'asc' ? 'desc' : 'asc' })}>
                                    <div className="flex items-center gap-2">
                                        {ALL_AVAILABLE_COLUMNS.find(c => c.id === colId)?.label}
                                        {sort?.key === colId && (sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.map(contact => (
                            <tr key={contact.id} className="hover:bg-indigo-50/30 transition-colors group">
                                {visibleColumns.map(colId => {
                                    const val = getFieldValue(contact, colId);
                                    return (
                                        <EditableCell key={colId} rowId={contact.id} field={colId === 'accountName' ? 'accountId' : colId} value={colId === 'accountName' ? contact.accountId : val}>
                                            {colId === 'isPrimary' ? (
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${val ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>
                                                    {val ? 'Primary' : 'Secondary'}
                                                </span>
                                            ) : colId === 'email' ? (
                                                <a href={`mailto:${val}`} className="text-indigo-600 hover:underline">{val}</a>
                                            ) : null}
                                        </EditableCell>
                                    );
                                })}
                                <td className="px-4 py-3 text-right">
                                    <button onClick={(e) => contact.id && onDeleteContact(contact.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Showing {processedData.length} contacts</span>
                <div className="flex items-center gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={14} /></button>
                    <span>Page {currentPage} of {totalPages || 1}</span>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
            </div>
        </div>
    );
};

export default memo(RecruiterContactsTab);
