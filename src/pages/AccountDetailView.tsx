import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Building2, MapPin, Globe, Phone, Mail,
    Users, Plus, MessageSquare, Clock, ArrowLeft,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { api } from '../services/api'; // We'll need to add getAccountDetails here
import type { Account, Contact, Activity } from '../types';

// Mock data until we connect real getAccountDetails
// Mock data removed


const AccountDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return;
            try {
                // Temporary: fetch all and find by ID until dedicated endpoint is ready
                const res = await api.getVendors('vendor');
                const found = res.data?.find((a: Account) => a.id === id);
                if (found) setAccount(found);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchAccount();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div></div>;
    if (!account) return <div className="p-8 text-center text-slate-500">Account not found</div>;



    // Stats for the header
    const healthColor = account?.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-100';

    return (
        <div className="min-h-screen bg-xiri-background p-6 font-sans">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} /> Back to Space
                </button>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex justify-between items-start">
                    <div className="flex gap-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-800">{account?.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${healthColor}`}>
                                    {account?.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {account?.address?.fullNumber || 'No Address'}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="flex items-center gap-1.5"><Globe size={14} /> {account?.website}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-indigo-500">{account?.industry}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-800">{account?.rating?.toFixed(1) || '-'}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score</div>
                    </div>
                </div>
            </div>

            {/* 3-Column Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

                {/* Left Column: Company Info (3 cols) */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-slate-400" />
                            About
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            {account?.aiContextSummary || "No AI summary available."}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                                <div className="font-medium text-slate-700">{account?.phone || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                <div className="font-medium text-slate-700">{account?.email || '-'}</div>
                            </div>
                            {account?.sqFt && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Facility Size</label>
                                    <div className="font-medium text-slate-700">{account.sqFt.toLocaleString()} sq ft</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI & Vetting Card */}
                    {(account?.vettingNotes || account?.aiContextSummary) && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-amber-500" />
                                AI Vetting & Intelligence
                            </h3>

                            {account?.vettingNotes && (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4">
                                    <h4 className="text-[10px] font-bold text-amber-700 uppercase mb-1">Automated Vetting Report</h4>
                                    <p className="text-xs text-amber-900 italic leading-relaxed">
                                        {account.vettingNotes}
                                    </p>
                                </div>
                            )}

                            {account?.aiContextSummary && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="text-[10px] font-bold text-indigo-700 uppercase mb-1">Deep Intelligence Summary</h4>
                                    <p className="text-xs text-indigo-900 leading-relaxed">
                                        {account.aiContextSummary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Center Column: Related Contacts & Deals (6 cols) */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Users size={18} className="text-indigo-500" />
                                Key Contacts
                            </h3>
                            <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Empty State Stub */}
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <div className="text-slate-400 font-medium text-sm">No contacts added yet</div>
                            <button className="text-indigo-600 font-bold text-sm mt-2 hover:underline">Add Primary Contact</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                Active Deals / Jobs
                            </h3>
                        </div>
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <div className="text-slate-400 font-medium text-sm">No active workflows</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed (3 cols) */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full min-h-[500px]">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <MessageSquare size={18} className="text-rose-500" />
                            Activity Feed
                        </h3>

                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                            {/* Feed Item Stub */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                                <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                    <Clock size={10} /> Just now
                                </div>
                                <p className="text-sm text-slate-600">
                                    <span className="font-bold text-slate-800">System</span> created this account from AI Import.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-indigo-100 border-2 border-white ring-1 ring-indigo-50" />
                                <div className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                    <Clock size={10} /> 2 mins ago
                                </div>
                                <p className="text-sm text-slate-600">
                                    <span className="font-bold text-slate-800">AI Agent</span> enriched profile data.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <textarea
                                placeholder="Log a note..."
                                className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none h-24 mb-2"
                            />
                            <button className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700">Post Note</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountDetailView;
