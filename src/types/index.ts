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

export interface Account {
    id?: string;
    name: string;
    type: 'prospect' | 'vendor';
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        fullNumber?: string;
    };
    sqFt?: number;
    status: 'New' | 'Contacted' | 'Vetting' | 'Active' | 'Inactive' | 'Lead' | 'Churned' | 'Rejected';
    rating: number;

    // Vendor specific
    trades?: string[];
    compliance?: {
        coiExpiry?: Date | string;
        w9OnFile?: boolean;
        insuranceVerified?: boolean;
        isLLC?: boolean;
    };

    // Metadata
    ownerId?: string;
    aiContextSummary?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Contact {
    id?: string;
    accountId: string;
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
}

export interface Activity {
    id?: string;
    accountId: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    content: string;
    createdBy: string;
    createdAt: Date | string;
}
