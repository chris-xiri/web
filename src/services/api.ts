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
    },

    updateVendor: async (vendorId: string, updates: any) => {
        const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    scrapeProspects: async (zipCode: string, query: string) => {
        // Reusing the same endpoint but logic might differ if backend separates them
        // For now, assuming scrapeVendorsHandler can handle generic queries if we modify it or add a new one
        // Note: The plan said "Create scrapeProspects (reuse logic if possible)".
        // Backend implementation reused runGoogleMapsScraper. 
        // Let's assume we use the same endpoint but maybe different semantic intent, 
        // OR we should have exposed a separate endpoint.
        // Looking at backend routes: router.post('/scrape', scrapeVendorsHandler);
        // scrapeVendorsHandler expects { zipCode, trade }.
        // We can pass `query` as `trade` for now as a quick hack, or better yet, update backend to be more generic.
        // BUT, for now, let's just stick to the existing endpoint.
        return api.scrapeVendors(zipCode, query);
    },

    importLeads: async (leads: any[], type: 'vendor' | 'prospect', ownerId?: string) => {
        const response = await fetch(`${API_URL}/vendors/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads, type, ownerId }),
        });
        return response.json();
    }
};
