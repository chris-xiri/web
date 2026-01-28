import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
            alert('Audit submitted successfully!');
            setNotes('');
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-xiri-background p-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-xiri-primary">Field Auditor Portal</h1>
                    <p className="text-xiri-secondary">Reviewing tonight's service jobs.</p>
                </header>

                <div className="space-y-6">
                    {/* Mock Job Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-xiri-primary">ABC Maintenance Corp</h3>
                                <p className="text-sm text-slate-500">HVAC Inspection - Job #12345</p>
                            </div>
                            <span className="bg-emerald-50 text-xiri-success px-3 py-1 rounded-full text-xs font-bold uppercase">Completed</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Quality Rating (1-10)</label>
                                <input
                                    type="range" min="1" max="10"
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-xiri-accent"
                                    value={rating}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                />
                                <div className="text-center font-bold text-xiri-accent">{rating}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any observations..."
                                ></textarea>
                            </div>

                            <button
                                onClick={() => handleSubmit('12345')}
                                disabled={submitting}
                                className="w-full bg-xiri-primary text-white py-3 rounded-xl font-bold hover:bg-xiri-secondary transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Audit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditView;
