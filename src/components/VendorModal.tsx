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
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">
                        {initialData ? 'Edit Vendor' : 'Add New Vendor'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Company Name *</label>
                            <input
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                value={formData.name || ''}
                                onChange={e => updateField('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Status</label>
                            <select
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
                                value={formData.status || 'New'}
                                onChange={e => updateField('status', e.target.value)}
                            >
                                <option value="New">New</option>
                                <option value="Outreach">In Sequence</option>
                                <option value="Onboarding">Onboarding</option>
                                <option value="Active">Active</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Unresponsive">Unresponsive</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.email || ''}
                                    onChange={e => updateField('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.phone || ''}
                                    onChange={e => updateField('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address & Trade */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Location & Trade</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Primary Trade</label>
                                <input
                                    placeholder="e.g. Janitorial, HVAC"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={primaryTrade}
                                    onChange={e => setPrimaryTrade(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Zip Code</label>
                                <input
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.address?.zipCode || ''}
                                    onChange={e => updateAddress('zipCode', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Compliance & Legal */}
                    <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={18} className="text-indigo-600" />
                            Compliance & Legal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?.insuranceVerified || false}
                                        onChange={e => updateCompliance('insuranceVerified', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-slate-700">Insurance Verified</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?.isLLC || false}
                                        onChange={e => updateCompliance('isLLC', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-slate-700">LLC Registered</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={formData.compliance?