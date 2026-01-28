import type { Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const jobService = {
    getTonightJobs: async (): Promise<Job[]> => {
        // In a real app, we'd fetch from API filtering by date and assigned user's territory.
        // For now, we might mock this or if backend ready, call it.
        // Since backend "generate jobs" creates jobs for today, we can query Firestore directly or via API.
        // Direct Firestore is easier for read-heavy frontend parts given Firebase usage.
        // But requirement says "Decoupled... xiri-api (Backend)".
        // Let's stick to Firebase SDK for reads (standard Firebase pattern) or API?
        // User said "Backend: Node.js (Express) API".
        // "Build two distinct authenticated views...".
        // I will use Firebase SDK for direct subscription (realtime) if possible, or API calls.
        // Given the prompt "Translate relational logic into NoSQL Collections", likely Firebase Client SDK is fine for Reads.
        // But "Scrape" and "Generate" are API endpoints.
        // "Submit Audit" is an API endpoint (POST /api/audit/submit).

        // Let's use Firestore SDK for reading Lists (better DX for React) and API for Actions.
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
