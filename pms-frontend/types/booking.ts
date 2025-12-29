export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface Booking {
    id: number;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    room_type_id: number;
    room_type_name: string;
    check_in: string; // ISO Date
    check_out: string; // ISO Date
    num_rooms: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: BookingStatus;
    notes?: string;
    created_at: string;

    // TODO: These fields will be added to backend later
    num_adults?: number;
    num_children?: number;
    payment_status?: PaymentStatus;
}


export interface CustomerInfo {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    id_proof_type?: string;
    id_proof_number?: string;
}

export interface BookingCreate {
    room_type_id: number;
    check_in: string; // ISO date string (YYYY-MM-DD)
    check_out: string; // ISO date string (YYYY-MM-DD)
    num_rooms: number;
    total_amount?: number; // Optional manual price override
    amount_paid?: number;
    notes?: string;
    customer: CustomerInfo;
}
