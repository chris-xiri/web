export interface Vendor {
    id: string;
    name: string;
    trade: string;
    zipCode: string;
    rating?: number;
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
