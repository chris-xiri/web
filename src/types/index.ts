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
    aiContextSummary?: string;
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

export interface User {
    uid: string;
    email: string;
    role: 'admin' | 'auditor';
    territoryId?: string;
}
