import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Star, MapPin, Calendar, CheckCircle2, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import LoadingBar from '../components/LoadingBar';

const AuditView = () => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (jobId: string) => {
        if (!user) return;
        setSubmitting(true);
        try {
            await api.submitAudit(jobId, rating, notes, user.uid);
            setSubmitted(true);
            setNotes('');
        } catch (err) {
            console.error(err);
            alert('Failed to submit audit. Please try again.');
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-xiri-background flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Audit Finalized</h2>
                    <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-tight">Report securely synced to cloud.</p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-xiri-background p-4 md:p-6 font-sans">
            <LoadingBar isLoading={submitting} />
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-200">
                                Field Audit
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Audit Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Territory {user?.territoryId || '001'}</div>
                            <div className="flex items-center justify-end gap-1.5 text-slate-700 font-bold text-xs">
                                <MapPin size={12} className="text-emerald-500" />
                                HQ Alpha
                            </div>
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header Image Pattern Replacement */}
                        <div className="h-20 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                            <div className="absolute -bottom-4 left-6 bg-white p-2.5 rounded-xl shadow-md border border-slate-100 text-slate-800">
                                <ClipboardCheck size={24} />
                            </div>
                        </div>

                        <div className="px-6 pt-8 pb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 tracking-tight">{account?.name || "ABC Maintenance Corp"}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded border border-slate-100">HVAC Systems</span>
                                        <span className="text-slate-200">•</span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                            <Calendar size={10} />
                                            Active Queue
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    <CheckCircle2 size={12} />
                                    READY
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                <Star size={14} className="text-amber-400" />
                                                Quality Assessment
                                            </label>
                                            <span className="text-lg font-black text-slate-900">{rating}/10</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="10"
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 transition-all hover:bg-slate-200"
                                            value={rating}
                                            onChange={(e) => setRating(parseInt(e.target.value))}
                                        />
                                        <div className="flex justify-between mt-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                            <span>Subpar</span>
                                            <span>Premium</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Metrics</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500 font-medium">Zone</span>
                                                <span className="font-black text-slate-800 uppercase tracking-tight">Main Hub Alpha</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-500 font-medium">Assignee</span>
                                                <span className="font-black text-slate-800 uppercase tracking-tight">Technical Lead 4</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare size={14} className="text-slate-400" />
                                            Field Observers
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-300 min-h-[120px] resize-none"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Document deviations or excellence..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSubmit('12345')}
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md shadow-slate-100 flex items-center justify-center gap-2 mt-6"
                            >
                                {submitting ? <RefreshCw className="animate-spin" size={14} /> : (
                                    <>
                                        COMMIT AUDIT TO CLOUD
                                        <ChevronRight size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditView;
