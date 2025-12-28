import { api } from '../lib/axios';

export interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    id_proof_type: string | null;
    id_proof_number: string | null;
    created_at: string;
    total_balance_due: number;
    booking_count?: number;
}

export interface CustomerBookingSummary {
    id: number;
    room_type_name: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    amount_paid: number;
    status: string;
}

export interface CustomerDetails extends Customer {
    bookings: CustomerBookingSummary[];
}

export interface CustomerUpdate {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    id_proof_type?: string;
    id_proof_number?: string;
}

export const customerService = {
    getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await api.get<Customer[]>(`/customers?${queryParams.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<CustomerDetails>(`/customers/${id}`);
        return response.data;
    },

    update: async (id: number, data: CustomerUpdate) => {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    }
};
