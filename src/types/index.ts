export interface Vendor {
    id: string;
    name?: string;
    companyName?: string;
    trade?: string;
    trades?: string[];
    zipCode?: string;
    rating?: number;
    website?: string;
    phone?: string;
    email?: string;
    aiContextSummary?: string;
    status?: 'Raw Lead' | 'Active';
}

export interface Job {
    id: string;
    vendorId: string;
    territoryId: string;
    status: 'assigned' | 'completed' | 'audited';
    date: string;
    vendorName?: string;
    trade?: string;
}

export interface Territory {
    id: string;
    name: string;
    zipCodes: string[];
}

export type UserRole = 'super_admin' | 'facility_manager' | 'sales' | 'recruiter' | 'auditor';

export interface User {
    uid: string;
    email: string;
    role: UserRole;
    territoryId?: string;
    viewMode?: 'sales' | 'recruiter' | 'auditor'; // For facility_manager to toggle views
}
export interface RawLead {
    companyName: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    rating?: number;
    trades?: string[];
    aiSummary?: string;
    source: 'google_maps';
    scrapedAt: string;
}
