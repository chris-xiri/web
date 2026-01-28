import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Star, MapPin, Calendar, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

const AuditView = () => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (jobId: string) => {
        if (!user) return;
        setSubmitting(true);
        try {
            await api.submitAudit(jobId, rating, notes, user.uid);
            alert('Audit report finalized!');
            setNotes('');
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-xiri-background p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 bg-xiri-accent/10 text-xiri-accent text-[10px] font-bold uppercase tracking-wider rounded-md border border-xiri-accent/10">
                                Field Ops
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">Audit Portal</h1>
                        <p className="text-slate-500 font-medium mt-1">Inspecting active service workflows.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</div>
                        <div className="flex items-center gap-1.5 text-xiri-primary font-bold">
                            <MapPin size={16} className="text-xiri-accent" />
                            Territory {user?.territoryId || '001'}
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        {/* Header Image/Pattern Replacement */}
                        <div className="h-32 bg-gradient-to-r from-xiri-primary to-xiri-secondary relative">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            <div className="absolute -bottom-6 left-8 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 text-xiri-primary">
                                <ClipboardCheck size={32} />
                            </div>
                        </div>

                        <div className="px-8 pt-10 pb-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-bold text-2xl text-xiri-primary">ABC Maintenance Corp</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded leading-none">HVAC Systems</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            Tonight, 9:00 PM
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                                    <CheckCircle2 size={14} />
                                    READY FOR AUDIT
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Star size={16} className="text-amber-500" />
                                                Quality Assessment
                                            </label>
                                            <span className="text-xl font-black text-xiri-accent">{rating}/10</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="10"
                                            className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-xiri-accent transition-all hover:bg-slate-200"
                                            value={rating}
                                            onChange={(e) => setRating(parseInt(e.target.value))}
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            <span>Subpar</span>
                                            <span>Premium</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Audit Details</h4>
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Service Area</span>
                                                <span className="font-bold text-xiri-primary">Rooftop Unit 4</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Technician</span>
                                                <span className="font-bold text-xiri-primary">John Doe</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <MessageSquare size={16} className="text-xiri-accent" />
                                            Field Notes
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-xiri-accent/20 focus:border-xiri-accent outline-none transition-all placeholder:text-slate-300 min-h-[140px]"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Document any deviations from service standards..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSubmit('12345')}
                                disabled={submitting}
                                className="w-full bg-xiri-primary text-white py-4 rounded-2xl font-bold hover:bg-xiri-secondary active:scale-[0.99] transition-all shadow-lg shadow-xiri-primary/20 flex items-center justify-center gap-2 mt-8"
                            >
                                {submitting ? <RefreshCw className="animate-spin" /> : (
                                    <>
                                        Finalize & Commit Audit
                                        <ChevronRight size={18} />
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
