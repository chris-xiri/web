import type { Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const jobService = {
    getTonightJobs: async (): Promise<Job[]> => {
        return [];
    }
};

export const api = {
    scrapeVendors: async (zipCode: string, trade: string) => {
        const response = await fetch(`${API_URL}/vendors/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipCode, trade }),
        });
        return response.json();
    },

    submitAudit: async (jobId: string, rating: number, notes: string, userId: string) => {
        const response = await fetch(`${API_URL}/audit/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, rating, notes, userId }),
        });
        return response.json();
    }
};
