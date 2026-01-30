import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Account } from '../types';

interface ProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Account>) => Promise<void>;
    initialData?: Account;
}

const ProspectModal = ({ isOpen, onClose, onSave, initialData }: ProspectModalProps) => {
    const [formData, setFormData] = useState<Partial<Account>>({
        name: '',
        status: 'New',
        type: 'prospect',
        phone: '',
        email: '',
        website: '',
        industry: '',
        sqFt: 0,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset for new entry
            setFormData({
                name: '',
                status: 'New',
                type: 'prospect',
                phone: '',
                email: '',
                website: '',
                industry: '',
                sqFt: 0,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: ''
                }
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save prospect", error);
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
                ...prev.address,
                [field]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        {initialData ? 'Edit Prospect' : 'Add New Prospect'}
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
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                value={formData.name || ''}
                                onChange={e => updateField('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Status</label>
                            <select
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all cursor-pointer"
                                value={formData.status || 'New'}
                                onChange={e => updateField('status', e.target.value)}
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Vetting">Vetting</option>
                                <option value="Active">Active</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.email || ''}
                                    onChange={e => updateField('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.phone || ''}
                                    onChange={e => updateField('phone', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Website</label>
                            <input
                                type="url"
                                placeholder="https://"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                value={formData.website || ''}
                                onChange={e => updateField('website', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Industry & Location */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Property & Location</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Industry</label>
                                <input
                                    placeholder="e.g. Retail, Medical"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.industry || ''}
                                    onChange={e => updateField('industry', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Square Footage</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.sqFt || ''}
                                    onChange={e => updateField('sqFt', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Street Address</label>
                                <input
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.address?.street || ''}
                                    onChange={e => updateAddress('street', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Zip Code</label>
                                <input
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.address?.zipCode || ''}
                                    onChange={e => updateAddress('zipCode', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">City</label>
                                <input
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.address?.city || ''}
                                    onChange={e => updateAddress('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">State</label>
                                <input
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                                    value={formData.address?.state || ''}
                                    onChange={e => updateAddress('state', e.target.value)}
                                />
                            </div>
                        </div>
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
                            className="px-5 py-2 bg-sky-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-sky-700 transition-all shadow-md shadow-sky-100 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed tracking-widest"
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

export default ProspectModal;
