export interface CustomerBookingSummary {
    id: number;
    room_type_name: string;
    check_in: string; // date
    check_out: string; // date
    total_amount: number;
    amount_paid: number;
    status: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    id_proof_type?: string;
    id_proof_number?: string;
    created_at: string;
    updated_at?: string;
    total_balance_due: number;
    bookings?: CustomerBookingSummary[];
    booking_count?: number;
}

export interface CustomerCreate {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    id_proof_type?: string;
    id_proof_number?: string;
}

export interface CustomerUpdate extends Partial<CustomerCreate> { }
