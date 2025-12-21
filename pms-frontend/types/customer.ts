export interface Customer {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    identity_doc_type?: string;
    identity_doc_number?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    outstanding_balance: number;
}

export interface CustomerCreate {
    full_name: string;
    email: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    identity_doc_type?: string;
    identity_doc_number?: string;
    notes?: string;
}

export interface CustomerUpdate extends Partial<CustomerCreate> { }
