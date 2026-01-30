import { useState, useEffect } from 'react';
import { X, Save, Loader2, ShieldCheck, Building2, FileText, ExternalLink, Calendar } from 'lucide-react';
import type { Account } from '../types';

interface VendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Account>) => Promise<void>;
    initialData?: Account;
}

const VendorModal = ({ isOpen, onClose, onSave, initialData }: VendorModalProps) => {
    const [formData, setFormData] = useState<Partial<Account>>({
        name: '',
        status: 'New',
        type: 'vendor',
        phone: '',
        email: '',
        website: '',
        trades: [],
        rating: 0,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },
        compliance: {
            insuranceVerified: false,
            isLLC: false,
            w9Signed: false,
            insuranceExpiry: ''
        }
    });

    const [primaryTrade, setPrimaryTrade] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                compliance: initialData.compliance || {
                    insuranceVerified: false,
                    isLLC: false,
                    w9Signed: false,
                    insuranceExpiry: ''
                }
            });
            setPrimaryTrade(initialData.trades?.[0] || '');
        } else {
            // Reset for new entry
            setFormData({
                name: '',
                status: 'New',
                type: 'vendor',
                phone: '',
                email: '',
                website: '',
                trades: [],
                rating: 0,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: ''
                },
                compliance: {
                    insuranceVerified: false,
                    isLLC: false,
                    w9Signed: false,
                    insuranceExpiry: ''
                }
            });
            setPrimaryTrade('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                trades: primaryTrade ? [primaryTrade] : [],
                address: {
                    ...formData.address
                },
                compliance: {
                    ...formData.compliance
                }
            };
            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error("Failed to save vendor", error);
        }
        setLoading(false);
    };

    const updateField = (field: keyof Account, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateAddress = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address as any,
                [field]: value
            }
        }));
    };

    const updateCompliance = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            compliance: {
                ...prev.compliance,
                [field]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        {initialData ? 'Edit Vendor' : 'Add New Vendor'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Company Name *</label>
                            <input
                                required
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                value={formData.name || ''}
                                onChange={e => updateField('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Status</label>
                            <select
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
                                value={formData.status || 'New'}
                                onChange={e => updateField('status', e.target.value)}
                            >
                                <option value="New">New</option>
                                <option value="Outreach">In Sequence</option>
                                <option value="Onboarding">Onboarding</option>
                                <option value="Vetting">Vetting</option>
                                <option value="Active">Active</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Unresponsive">Unresponsive</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.email || ''}
                                    onChange={e => updateField('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.phone || ''}
                                    onChange={e => updateField('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address & Trade */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Location & Trade</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Primary Trade</label>
                                <input
                                    placeholder="e.g. Janitorial, HVAC"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={primaryTrade}
                                    onChange={e => setPrimaryTrade(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Zip Code</label>
                                <input
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.address?.zipCode || ''}
                                    onChange={e => updateAddress('zipCode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Compliance & Legal */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={16} className="text-indigo-600" />
                            Compliance & Legal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?.insuranceVerified || false}
                                        onChange={e => updateCompliance('insuranceVerified', e.target.checked)}
                                    />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Insurance Verified</span>
                                </label>

                                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?.isLLC || false}
                                        onChange={e => updateCompliance('isLLC', e.target.checked)}
                                    />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">LLC Registered</span>
                                </label>

                                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?.w9Signed || false}
                                        onChange={e => updateCompliance('w9Signed', e.target.checked)}
                                    />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">W-9 Received</span>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-1">
                                        <Calendar size={12} /> Insurance Expiration
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        value={formData.compliance?.insuranceExpiry ? (typeof formData.compliance.insuranceExpiry === 'string' ? formData.compliance.insuranceExpiry.split('T')[0] : formData.compliance.insuranceExpiry.toISOString().split('T')[0]) : ''}
                                        onChange={e => updateCompliance('insuranceExpiry', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <FileText size={14} /> Documents
                                    </label>
                                    <div className="space-y-2">
                                        {formData.complianceDocs && formData.complianceDocs.length > 0 ? (
                                            formData.complianceDocs.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs text-indigo-600 font-medium hover:bg-slate-50 transition-all"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <FileText size={12} className="text-slate-400" />
                                                        {doc.name}
                                                    </span>
                                                    <ExternalLink size={12} />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-slate-400 italic p-3 border border-dashed border-slate-200 rounded-xl text-center">
                                                No documents uploaded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Intel & Vetting Reports */}
                        {(formData.vettingNotes || formData.aiContextSummary) && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-slate-400" />
                                    AI Intelligence & Vetting
                                </h3>

                                {formData.vettingNotes && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase mb-2">
                                            <ShieldAlert size={16} /> Automated Vetting Report
                                        </div>
                                        <p className="text-sm text-amber-900 leading-relaxed italic">
                                            {formData.vettingNotes}
                                        </p>
                                    </div>
                                )}

                                {formData.aiContextSummary && (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase mb-2">
                                            <FileText size={16} /> Deep Analysis Summary
                                        </div>
                                        <p className="text-sm text-indigo-900 leading-relaxed">
                                            {formData.aiContextSummary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg font-black text-[10px] uppercase text-slate-500 hover:bg-slate-100 transition-all tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed tracking-widest"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {initialData ? 'Update Account' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorModal;
