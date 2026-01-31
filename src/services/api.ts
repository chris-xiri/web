import type { Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const jobService = {
    getTonightJobs: async (): Promise<Job[]> => {
        return [];
    }
};

export const api = {
    scrapeVendors: async (location: string, trade: string, radius: number = 10) => {
        const response = await fetch(`${API_URL}/vendors/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, trade, radius }),
        });
        return response.json();
    },

    getLocationSuggestions: async (query: string) => {
        const response = await fetch(`${API_URL}/vendors/autocomplete?query=${encodeURIComponent(query)}`);
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

    createVendor: async (data: any) => {
        const response = await fetch(`${API_URL}/vendors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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

    deleteVendor: async (vendorId: string) => {
        const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    },

    startOutreachSequence: async (vendorId: string) => {
        const response = await fetch(`${API_URL}/vendors/${vendorId}/start-sequence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    },

    scrapeProspects: async (zipCode: string, query: string) => {
        const response = await fetch(`${API_URL}/crm/prospects/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipCode, query }),
        });
        return response.json();
    },

    importLeads: async (leads: any[], type: 'vendor' | 'prospect', ownerId?: string, status?: string) => {
        // Use specific endpoint for prospects, fallback to generic for vendors if needed (or create separate)
        const endpoint = type === 'prospect' ? '/crm/prospects/import' : '/vendors/import';

        const body: any = { leads, ownerId, status };
        if (type === 'vendor') body.type = 'vendor'; // vendor endpoint expects strict type if generic

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.json();
    },

    getVendors: async (type: 'vendor' | 'prospect' = 'vendor') => {
        const response = await fetch(`${API_URL}/vendors?type=${type}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    },

    getActivities: async () => {
        const response = await fetch(`${API_URL}/activities`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    },
    getContacts: async (accountId?: string) => {
        const url = accountId ? `${API_URL}/contacts?accountId=${accountId}` : `${API_URL}/contacts`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    },
    createContact: async (data: any) => {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    updateContact: async (id: string, updates: any) => {
        const response = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return response.json();
    },
    deleteContact: async (id: string) => {
        const response = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
    }
};
