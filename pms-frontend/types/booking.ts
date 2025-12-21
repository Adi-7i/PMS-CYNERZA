export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface Booking {
    id: number;
    customer_id: number;
    room_type_id: number;
    room_id?: number | null;
    status: BookingStatus;
    check_in: string; // ISO Date
    check_out: string; // ISO Date
    num_adults: number;
    num_children: number;
    num_rooms: number;
    total_amount: number;
    amount_paid: number;
    payment_status: PaymentStatus;
    notes?: string;
    created_at: string;
    updated_at: string;

    // Relations (optional/loaded)
    customer?: {
        full_name: string;
        email: string;
    };
    room_type?: {
        name: string;
    };
    room?: {
        number: string;
    };
}

export interface BookingCreate {
    customer_id?: number; // Optional if creating new customer inline
    customer?: {
        full_name: string;
        email: string;
        phone?: string;
    };
    room_type_id: number;
    check_in: Date;
    check_out: Date;
    num_adults: number;
    num_children: number;
    num_rooms: number;
    notes?: string;
}
