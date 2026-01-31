import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Building2, MapPin, Globe, Phone, Mail,
    Users, Plus, MessageSquare, Clock, ArrowLeft,
    CheckCircle2, AlertCircle, ShieldCheck, Edit
} from 'lucide-react';
import { api } from '../services/api';
import VendorModal from '../components/VendorModal';
import type { Account, Contact, Activity } from '../types';

const AccountDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState<Account | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAccount = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [vendorsRes, prospectsRes, contactsRes] = await Promise.all([
                api.getVendors('vendor'),
                api.getVendors('prospect'),
                api.getContacts(id)
            ]);

            const found = vendorsRes.data?.find((a: Account) => a.id === id) ||
                prospectsRes.data?.find((a: Account) => a.id === id);

            if (found) setAccount(found);

            if (contactsRes.data) {
                setContacts(contactsRes.data);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAccount();
    }, [id]);

    const handleSave = async (data: Partial<Account>) => {
        if (!id) return;
        try {
            await api.updateVendor(id, data);
            await fetchAccount();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update account", error);
            alert("Failed to update account");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div></div>;
    if (!account) return <div className="p-8 text-center text-slate-500">Account not found</div>;

    const healthColor = account?.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-100';

    return (
        <div className="min-h-screen bg-xiri-background p-6 font-sans">
            <div className="max-w-[1400px] mx-auto mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-3 transition-colors font-black text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={12} /> Back
                </button>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-slate-100">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{account?.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${healthColor} border border-current opacity-70`}>
                                    {account?.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                                <span className="flex items-center gap-1"><MapPin size={10} /> {account?.address?.city || 'No Location'}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="flex items-center gap-1 font-sans lowercase truncate max-w-[150px]">
                                    <Globe size={10} className="mr-1" />
                                    {account?.website ? (
                                        <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                            {account.website}
                                        </a>
                                    ) : '-'}
                                </span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-indigo-400">{account?.industry}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                            <Edit size={14} /> Edit Profile
                        </button>
                        <div className="text-right">
                            <div className="text-xl font-black text-slate-900 leading-tight">{account?.rating?.toFixed(1) || '-'}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quality score</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <AlertCircle size={14} className="text-slate-300" />
                            Description
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-4 italic">
                            {account?.aiContextSummary || "No AI summary available."}
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Phone</label>
                                <div className="text-xs font-bold text-slate-700">{account?.phone || '-'}</div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Email</label>
                                <div className="text-xs font-bold text-slate-700 truncate">
                                    {account?.email ? (
                                        <a href={`mailto:${account.email}`} className="text-indigo-600 hover:underline">
                                            {account.email}
                                        </a>
                                    ) : '-'}
                                </div>
                            </div>
                            {account?.sqFt && (
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Facility Size</label>
                                    <div className="text-xs font-bold text-slate-700">{account.sqFt.toLocaleString()} SQFT</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {(account?.vettingNotes || account?.aiContextSummary) && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-amber-500" />
                                Vetting Report
                            </h3>
                            {account?.vettingNotes && (
                                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 mb-3">
                                    <p className="text-[11px] text-amber-900 italic leading-relaxed">{account.vettingNotes}</p>
                                </div>
                            )}
                            {account?.aiContextSummary && (
                                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                    <p className="text-[11px] text-indigo-900 leading-relaxed">{account.aiContextSummary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-6 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                                <Users size={14} className="text-indigo-400" />
                                Stakeholders
                            </h3>
                            <button className="p-1 hover:bg-slate-50 rounded text-slate-300 hover:text-indigo-600 transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <div key={contact.id} className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-[12px] text-slate-900">{contact.firstName} {contact.lastName}</div>
                                            {contact.isPrimary && (
                                                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-1 py-0.5 rounded border border-emerald-100">Primary</span>
                                            )}
                                        </div>
                                        {contact.title && <div className="text-[10px] text-slate-500 font-medium mb-2">{contact.title}</div>}
                                        <div className="flex flex-col gap-1">
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-indigo-600">
                                                    <Mail size={10} /> {contact.email}
                                                </a>
                                            )}
                                            {contact.phone && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                    <Phone size={10} /> {contact.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 border border-dashed border-slate-100 rounded-lg bg-slate-50/20">
                                    <div className="text-slate-300 font-bold text-[10px] uppercase tracking-wider">No contacts added</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                Project Flow
                            </h3>
                        </div>
                        <div className="text-center py-6 border border-dashed border-slate-100 rounded-lg bg-slate-50/20">
                            <div className="text-slate-300 font-bold text-[10px] uppercase tracking-wider">No active workflows</div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-full min-h-[400px] flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <MessageSquare size={14} className="text-rose-400" />
                            Operations Log
                        </h3>
                        <div className="relative pl-3 border-l-2 border-slate-50 space-y-5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                            <div className="relative">
                                <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-slate-100 border border-white" />
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-0.5 flex items-center gap-1">
                                    <Clock size={8} /> Just now
                                </div>
                                <p className="text-[11px] text-slate-600 leading-tight">
                                    <span className="font-bold text-slate-800">System</span> initialized account profile.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <textarea
                                placeholder="Log a note..."
                                className="w-full bg-slate-50 border-0 rounded-lg p-2 text-[11px] focus:ring-1 focus:ring-slate-200 outline-none resize-none h-16 mb-2 font-medium"
                            />
                            <button className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Submit</button>
                        </div>
                    </div>
                </div>
            </div>

            <VendorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={account || undefined}
            />
        </div>
    );
};

export default AccountDetailView;
