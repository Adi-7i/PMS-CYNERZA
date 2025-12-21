import { apiClient } from './client';
import type { Customer, CustomerCreate, CustomerUpdate } from '@/types/customer';

export const customerApi = {
    getAll: async (page = 1, limit = 10, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('q', search);

        const { data } = await apiClient.get<{ data: Customer[]; total: number; page: number; limit: number }>('/customers', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await apiClient.get<Customer>(`/customers/${id}`);
        return data;
    },

    create: async (customer: CustomerCreate) => {
        const { data } = await apiClient.post<Customer>('/customers', customer);
        return data;
    },

    update: async (id: number, customer: CustomerUpdate) => {
        const { data } = await apiClient.put<Customer>(`/customers/${id}`, customer);
        return data;
    },

    getHistory: async (id: number) => {
        // Assuming a booking history endpoint exists or part of customer details
        const { data } = await apiClient.get<any[]>(`/customers/${id}/bookings`);
        return data;
    }
};
